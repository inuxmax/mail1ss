import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/gmail/callback`;

export const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
};

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

export async function getGmailProfile(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const res = await gmail.users.getProfile({ userId: 'me' });
  return res.data;
}

export async function getGmailLabelStats(accessToken: string, query: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 1,
  });
  
  return res.data.resultSizeEstimate || 0;
}

export async function getStrictGmailLabelStats(accessToken: string, query: string, targetEmails: string[]) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  // List messages (max 500 to be safe with quota)
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 500,
  });
  
  if (!res.data.messages || res.data.messages.length === 0) return 0;
  
  // Optimization: if resultSizeEstimate is small, we trust it?
  // No, user complained about 201.
  // If resultSizeEstimate > 500, we probably should return 500+?
  // Let's stick to counting up to 500 for now.

  const messages = res.data.messages;
  let count = 0;
  const BATCH_SIZE = 10;
  
  // Parallel limit for Promise.all
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    
    // We use Promise.all to fetch metadata in parallel
    const results = await Promise.all(batch.map(async (msg) => {
        if (!msg.id) return false;
        try {
            const detail = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'metadata',
                metadataHeaders: ['To', 'Cc', 'Delivered-To']
            });
            
            // If checking for unread, verify label presence (handle search index latency)
            if (query.includes('is:unread') || query.includes('label:unread')) {
                 if (!detail.data.labelIds?.includes('UNREAD')) {
                     return false;
                 }
            }
            
            const headers = detail.data.payload?.headers;
            if (!headers) return false;

            const to = headers.find(h => h.name === 'To')?.value || '';
            const cc = headers.find(h => h.name === 'Cc')?.value || '';
            const deliveredTo = headers.find(h => h.name === 'Delivered-To')?.value || '';

            return targetEmails.some(email => 
                to.includes(email) || cc.includes(email) || deliveredTo.includes(email)
            );
        } catch (e) {
            console.error(`Failed to check message ${msg.id}`, e);
            return false;
        }
    }));
    count += results.filter(Boolean).length;
  }

  return count;
}

export async function listMessages(accessToken: string, query: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 20
  });
  return res.data.messages || [];
}

export async function getMessage(accessToken: string, messageId: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  });
  return res.data;
}

export async function markMessageAsRead(accessToken: string, messageId: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['UNREAD']
    }
  });
}
