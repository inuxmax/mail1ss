import { constructMetadata } from "@/lib/utils";
import FeedbackPage from "@/components/feedback/feedback-page";

export const metadata = constructMetadata({
  title: "Feedback",
  description: "Help us do better",
});

export default async function Page() {
  return <FeedbackPage />;
}
