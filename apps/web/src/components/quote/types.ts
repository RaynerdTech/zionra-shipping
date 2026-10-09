export type QuoteAgentSummary = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  verified: boolean;
  rating: number | null;
  reviewCount: number;
  shipmentCount: number | null;
  onTimeRate: number | null;
  responseTime: string | null;
  collectionMethod: string | null;
  deliveryMethod: string | null;
  insuranceAvailable: boolean | null;
  shipmentFrequency: string | null;
  shippingMethod: string | null;
  collectionCities: string[];
  itemsHandled: string[];
  pricePerKgEur: number | null;
  estimatedPriceGbp: number | null;
  deliveryEstimate: string | null;
  bestMatchScore: number;
  speedRank: number;
  responseRank: number;
};

export type QuoteReview = {
  id: string;
  source: "GOOGLE";
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  comment: string | null;
  reviewedAt: string;
};

export type QuoteAgentDetail = Omit<
  QuoteAgentSummary,
  "estimatedPriceGbp" | "deliveryEstimate" | "bestMatchScore" | "speedRank" | "responseRank"
> & {
  bio: string | null;
  eurToGbpRate: number;
  reviews: QuoteReview[];
};

export type QuoteAgentsResponse = {
  agents: QuoteAgentSummary[];
  total: number;
  currency: "GBP";
  rate: {
    from: "EUR";
    to: "GBP";
    value: number;
  };
};
