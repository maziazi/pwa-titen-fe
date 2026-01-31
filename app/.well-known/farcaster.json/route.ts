function withValidProperties(properties: Record<string, undefined | string | string[]>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value
    )
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;

  const manifest = {
    accountAssociation: {
      header: process.env.ACCOUNT_ASSOCIATION_HEADER || "",
      payload: process.env.ACCOUNT_ASSOCIATION_PAYLOAD || "",
      signature: process.env.ACCOUNT_ASSOCIATION_SIGNATURE || "",
    },
    miniapp: {
      version: "1",
      name: "Titen",
      homeUrl: URL,
      iconUrl: `${URL}/icon.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#111118",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: "AI-powered social media automation",
      description:
        "Transform your raw ideas into viral posts using advanced LLMs. Enable seamless Web3 tipping and on-chain monetization.",
      screenshotUrls: [
        `${URL}/screenshot-1.png`,
        `${URL}/screenshot-2.png`,
        `${URL}/screenshot-3.png`,
      ],
      primaryCategory: "social",
      tags: ["ai", "social-media", "web3", "monetization", "automation"],
      heroImageUrl: `${URL}/hero-image.png`,
      tagline: "Automate & Monetize On-Chain",
      ogTitle: "Titen - AI Social Media Automation",
      ogDescription:
        "Prediction Market with AI Assistance. Swipe to predict and trade on future events seamlessly.",
      ogImageUrl: `${URL}/og-image.png`,
      noindex: true,
    },
  };

  return Response.json(withValidProperties(manifest));
}