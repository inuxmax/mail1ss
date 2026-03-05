import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getOAuth2Client, getMessage } from '@/lib/gmail';

export async function syncGmailMessages(
  userId: string,
  gmailAccountId: string,
  tempEmailAddress: string,
  accessToken: string
) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Get UserTempGmail ID
  const tempGmail = await prisma.userTempGmail.findUnique({
    where: { tempEmailAddress: tempEmailAddress },
  });

  if (!tempGmail) return;

  // List messages from Gmail
  // We use strict query to match the alias
  const query = `to:${tempEmailAddress}`;
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 20, // Limit to 20 for performance on sync
  });

  const messages = res.data.messages || [];

  for (const msg of messages) {
    if (!msg.id) continue;

    // Check if message already exists in DB
    const existing = await prisma.tempGmailMessage.findUnique({
      where: { gmailId: msg.id },
    });

    if (existing) {
       // Update labelIds (read status) if changed
       // But wait, if we manage read status locally, we might NOT want to overwrite it from Gmail
       // unless we want 2-way sync.
       // The user said: "sau đó đọc dữ liệu để hiển thị và cho chức năng đọc mail nó hoạt động đúng"
       // This implies local control is better.
       // However, if the user reads it on Gmail, should it be read here? Probably yes.
       // But if we read it here, it should be read here.
       // Let's only update if we haven't marked it as read locally?
       // Actually, let's trust the DB for 'isRead' status primarily.
       // But we might want to update other fields if they are missing.
       continue;
    }

    // Fetch full message details
    try {
        const detail = await getMessage(accessToken, msg.id);
        const headers = detail.payload?.headers;
        
        const to = headers?.find(h => h.name === 'To')?.value || '';
        const cc = headers?.find(h => h.name === 'Cc')?.value || '';
        const deliveredTo = headers?.find(h => h.name === 'Delivered-To')?.value || '';

        // Strict filtering
        if (!to.includes(tempEmailAddress) && !cc.includes(tempEmailAddress) && !deliveredTo.includes(tempEmailAddress)) {
            continue;
        }

        const subject = headers?.find(h => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers?.find(h => h.name === 'From')?.value || '(Unknown)';
        const dateStr = headers?.find(h => h.name === 'Date')?.value;
        const date = dateStr ? new Date(dateStr) : new Date();
        const internalDate = detail.internalDate;
        const snippet = detail.snippet;
        const labelIds = detail.labelIds || [];
        const isRead = !labelIds.includes('UNREAD');

        // Extract body
        const decode = (str: string) => {
            return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
        };
    
        const getBody = (payload: any): { html?: string, text?: string } => {
          let html = '';
          let text = '';
          
          if (payload.body && payload.body.data) {
             const decoded = decode(payload.body.data);
             if (payload.mimeType === 'text/html') html = decoded;
             else text = decoded;
          }
          
          if (payload.parts) {
            for (const part of payload.parts) {
              if (part.mimeType === 'text/html') {
                 if (part.body && part.body.data) {
                    html = decode(part.body.data);
                 }
              } else if (part.mimeType === 'text/plain') {
                 if (part.body && part.body.data) {
                    text = decode(part.body.data);
                 }
              } else if (part.parts) { 
                 const sub = getBody(part);
                 if (sub.html) html = sub.html;
                 if (sub.text) text = sub.text;
              }
            }
          }
          return { html, text };
        };

        const { html, text } = getBody(detail.payload);

        await prisma.tempGmailMessage.create({
            data: {
                tempGmailId: tempGmail.id,
                gmailId: msg.id,
                threadId: msg.threadId || '',
                snippet,
                subject,
                from,
                to: to || tempEmailAddress, // fallback
                date,
                internalDate,
                labelIds,
                isRead,
                html,
                text
            }
        });

    } catch (e) {
        console.error(`Failed to sync message ${msg.id}`, e);
    }
  }
}
