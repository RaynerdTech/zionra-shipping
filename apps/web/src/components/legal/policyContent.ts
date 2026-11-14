/** Text is transcribed from the supplied DOCX drafts without policy changes. */
export type PolicyBlock = { type: "paragraph" | "subheading" | "list"; text: string };
export type PolicySection = { number: number; title: string; blocks: PolicyBlock[] };
export type PolicyDocument = { title: string; preamble: PolicyBlock[]; sections: PolicySection[] };
export const policyDocuments: Record<"terms" | "refund", PolicyDocument> = {
  "terms": {
    "title": "ZIONRA TERMS & CONDITIONS",
    "preamble": [
      {
        "type": "paragraph",
        "text": "Effective Date: [Insert Date]"
      },
      {
        "type": "paragraph",
        "text": "Last Updated: [Insert Date]"
      },
      {
        "type": "paragraph",
        "text": "Welcome to Zionra. These Terms & Conditions (“Terms”) govern your access to and use of the Zionra platform, website, mobile services, and related services."
      },
      {
        "type": "paragraph",
        "text": "By using Zionra, you agree to these Terms."
      }
    ],
    "sections": [
      {
        "number": 1,
        "title": "Who We Are",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Zionra is a technology-enabled marketplace platform that connects customers with independent third-party shipping agents for cross-border deliveries."
          },
          {
            "type": "paragraph",
            "text": "Zionra is not:"
          },
          {
            "type": "list",
            "text": "a courier company"
          },
          {
            "type": "list",
            "text": "freight operator"
          },
          {
            "type": "list",
            "text": "customs broker"
          },
          {
            "type": "list",
            "text": "shipping carrier"
          },
          {
            "type": "paragraph",
            "text": "We do not directly transport parcels."
          },
          {
            "type": "paragraph",
            "text": "Our role includes:"
          },
          {
            "type": "list",
            "text": "helping customers compare verified shipping agents"
          },
          {
            "type": "list",
            "text": "facilitating secure payments"
          },
          {
            "type": "list",
            "text": "coordinating shipment tracking updates"
          },
          {
            "type": "list",
            "text": "providing customer support"
          },
          {
            "type": "list",
            "text": "assisting with dispute resolution where applicable"
          }
        ]
      },
      {
        "number": 2,
        "title": "Eligibility",
        "blocks": [
          {
            "type": "paragraph",
            "text": "To use Zionra:"
          },
          {
            "type": "list",
            "text": "You must be at least 18 years old"
          },
          {
            "type": "list",
            "text": "You must provide accurate information"
          },
          {
            "type": "list",
            "text": "You must have legal authority to ship your goods"
          },
          {
            "type": "paragraph",
            "text": "We may suspend accounts involved in fraud, abuse, or illegal activity."
          }
        ]
      },
      {
        "number": 3,
        "title": "Booking Process",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Customers may:"
          },
          {
            "type": "list",
            "text": "submit shipment details"
          },
          {
            "type": "list",
            "text": "compare shipping quotes"
          },
          {
            "type": "list",
            "text": "choose an agent"
          },
          {
            "type": "list",
            "text": "complete payment through Zionra"
          },
          {
            "type": "paragraph",
            "text": "Final prices may vary based on:"
          },
          {
            "type": "list",
            "text": "package weight"
          },
          {
            "type": "list",
            "text": "dimensions"
          },
          {
            "type": "list",
            "text": "destination"
          },
          {
            "type": "list",
            "text": "shipping type"
          },
          {
            "type": "list",
            "text": "customs requirements"
          },
          {
            "type": "list",
            "text": "handling requirements"
          },
          {
            "type": "paragraph",
            "text": "Final pricing is displayed before payment."
          }
        ]
      },
      {
        "number": 4,
        "title": "Fees & Payments",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Customers may pay:"
          },
          {
            "type": "subheading",
            "text": "A. Agent Shipping Fee"
          },
          {
            "type": "paragraph",
            "text": "Charges based on shipment details."
          },
          {
            "type": "subheading",
            "text": "B. Agent Handling Fee"
          },
          {
            "type": "paragraph",
            "text": "Charges for:"
          },
          {
            "type": "list",
            "text": "pickup logistics"
          },
          {
            "type": "list",
            "text": "customs processing"
          },
          {
            "type": "list",
            "text": "handling services"
          },
          {
            "type": "list",
            "text": "delivery logistics"
          },
          {
            "type": "subheading",
            "text": "C. Zionra Service & Protection Fee"
          },
          {
            "type": "paragraph",
            "text": "This covers:"
          },
          {
            "type": "list",
            "text": "secure payments"
          },
          {
            "type": "list",
            "text": "platform operations"
          },
          {
            "type": "list",
            "text": "customer support"
          },
          {
            "type": "list",
            "text": "dispute support"
          },
          {
            "type": "list",
            "text": "shipment coordination"
          },
          {
            "type": "paragraph",
            "text": "Current pricing structure:"
          },
          {
            "type": "paragraph",
            "text": "Orders below £100 → £7"
          },
          {
            "type": "paragraph",
            "text": "Orders £100–£250 → £12"
          },
          {
            "type": "paragraph",
            "text": "Orders above £250 → £20"
          },
          {
            "type": "paragraph",
            "text": "Zionra may update pricing at any time."
          }
        ]
      },
      {
        "number": 5,
        "title": "Payment Processing",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Payments are processed by third-party providers such as Stripe."
          },
          {
            "type": "paragraph",
            "text": "By making payments through Zionra, users agree to third-party payment provider terms."
          },
          {
            "type": "paragraph",
            "text": "Zionra is not responsible for payment processor outages."
          }
        ]
      },
      {
        "number": 6,
        "title": "Shipping Timelines",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Estimated delivery times are estimates only."
          },
          {
            "type": "paragraph",
            "text": "Delays may occur due to:"
          },
          {
            "type": "list",
            "text": "customs inspections"
          },
          {
            "type": "list",
            "text": "weather"
          },
          {
            "type": "list",
            "text": "holidays"
          },
          {
            "type": "list",
            "text": "transportation disruptions"
          },
          {
            "type": "list",
            "text": "incomplete customer information"
          },
          {
            "type": "paragraph",
            "text": "Zionra does not guarantee exact delivery dates."
          }
        ]
      },
      {
        "number": 7,
        "title": "Prohibited, Restricted & Contraband Goods",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Customers must not ship prohibited, illegal, restricted, or contraband goods."
          },
          {
            "type": "paragraph",
            "text": "This includes:"
          },
          {
            "type": "list",
            "text": "illegal drugs"
          },
          {
            "type": "list",
            "text": "weapons"
          },
          {
            "type": "list",
            "text": "ammunition"
          },
          {
            "type": "list",
            "text": "explosives"
          },
          {
            "type": "list",
            "text": "counterfeit goods"
          },
          {
            "type": "list",
            "text": "hazardous chemicals"
          },
          {
            "type": "list",
            "text": "restricted medications"
          },
          {
            "type": "list",
            "text": "illegal wildlife products"
          },
          {
            "type": "list",
            "text": "stolen goods"
          },
          {
            "type": "list",
            "text": "cash/currency"
          },
          {
            "type": "list",
            "text": "forged documents"
          },
          {
            "type": "list",
            "text": "human remains"
          },
          {
            "type": "paragraph",
            "text": "Restricted items may vary based on:"
          },
          {
            "type": "list",
            "text": "UK export laws"
          },
          {
            "type": "list",
            "text": "Nigerian import laws"
          },
          {
            "type": "list",
            "text": "airline restrictions"
          },
          {
            "type": "list",
            "text": "customs regulations"
          },
          {
            "type": "paragraph",
            "text": "Examples include:"
          },
          {
            "type": "list",
            "text": "lithium batteries"
          },
          {
            "type": "list",
            "text": "perfumes"
          },
          {
            "type": "list",
            "text": "alcohol"
          },
          {
            "type": "list",
            "text": "perishables"
          },
          {
            "type": "list",
            "text": "flammable products"
          },
          {
            "type": "list",
            "text": "medical supplies"
          },
          {
            "type": "list",
            "text": "confidential documents"
          },
          {
            "type": "paragraph",
            "text": "Customers are solely responsible for ensuring legal compliance."
          },
          {
            "type": "paragraph",
            "text": "By booking through Zionra, customers confirm their goods are legal."
          },
          {
            "type": "paragraph",
            "text": "Customs authorities may:"
          },
          {
            "type": "list",
            "text": "inspect"
          },
          {
            "type": "list",
            "text": "delay"
          },
          {
            "type": "list",
            "text": "seize"
          },
          {
            "type": "list",
            "text": "destroy shipments"
          },
          {
            "type": "paragraph",
            "text": "Zionra is not liable for prohibited shipments."
          },
          {
            "type": "paragraph",
            "text": "No refunds will be issued for prohibited shipments."
          }
        ]
      },
      {
        "number": 8,
        "title": "Customer Responsibilities",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Customers must:"
          },
          {
            "type": "list",
            "text": "provide accurate package information"
          },
          {
            "type": "list",
            "text": "provide correct addresses"
          },
          {
            "type": "list",
            "text": "package goods appropriately"
          },
          {
            "type": "list",
            "text": "ensure goods are legal to ship"
          },
          {
            "type": "paragraph",
            "text": "Customers are responsible for losses caused by inaccurate information."
          }
        ]
      },
      {
        "number": 9,
        "title": "Agent Responsibilities",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Agents are independent businesses."
          },
          {
            "type": "paragraph",
            "text": "Agents are responsible for:"
          },
          {
            "type": "list",
            "text": "collection"
          },
          {
            "type": "list",
            "text": "transportation"
          },
          {
            "type": "list",
            "text": "customs handling"
          },
          {
            "type": "list",
            "text": "final delivery"
          },
          {
            "type": "paragraph",
            "text": "Agents must comply with Zionra service standards."
          }
        ]
      },
      {
        "number": 10,
        "title": "Refunds",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Refunds may apply for:"
          },
          {
            "type": "list",
            "text": "failed pickup"
          },
          {
            "type": "list",
            "text": "duplicate payments"
          },
          {
            "type": "list",
            "text": "cancelled bookings before dispatch"
          },
          {
            "type": "list",
            "text": "major service failures"
          },
          {
            "type": "paragraph",
            "text": "Refunds may not apply for:"
          },
          {
            "type": "list",
            "text": "customs seizures"
          },
          {
            "type": "list",
            "text": "prohibited goods"
          },
          {
            "type": "list",
            "text": "incorrect customer information"
          },
          {
            "type": "list",
            "text": "cancellations after dispatch"
          },
          {
            "type": "paragraph",
            "text": "Refunds typically take 5–10 business days"
          }
        ]
      },
      {
        "number": 11,
        "title": "Shipment Protection Claims",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Claims may apply for:"
          },
          {
            "type": "list",
            "text": "lost goods"
          },
          {
            "type": "list",
            "text": "damaged goods"
          },
          {
            "type": "list",
            "text": "major delivery failures"
          },
          {
            "type": "paragraph",
            "text": "Claims must be submitted within [insert timeframe]"
          },
          {
            "type": "paragraph",
            "text": "Compensation may be limited."
          }
        ]
      },
      {
        "number": 12,
        "title": "Limitation of Liability",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Zionra is a marketplace platform."
          },
          {
            "type": "paragraph",
            "text": "We are not directly liable for:"
          },
          {
            "type": "list",
            "text": "carrier negligence"
          },
          {
            "type": "list",
            "text": "customs delays"
          },
          {
            "type": "list",
            "text": "customs seizures"
          },
          {
            "type": "list",
            "text": "force majeure events"
          },
          {
            "type": "paragraph",
            "text": "Zionra’s liability is limited to fees paid directly to Zionra unless required by law."
          }
        ]
      },
      {
        "number": 13,
        "title": "Account Suspension",
        "blocks": [
          {
            "type": "paragraph",
            "text": "We may suspend accounts for:"
          },
          {
            "type": "list",
            "text": "fraud"
          },
          {
            "type": "list",
            "text": "abuse"
          },
          {
            "type": "list",
            "text": "illegal activity"
          },
          {
            "type": "list",
            "text": "policy violations"
          }
        ]
      },
      {
        "number": 14,
        "title": "Intellectual Property",
        "blocks": [
          {
            "type": "paragraph",
            "text": "All Zionra branding, logos, content, and platform materials belong to Zionra."
          },
          {
            "type": "paragraph",
            "text": "Users may not copy or exploit our materials without written permission."
          }
        ]
      },
      {
        "number": 15,
        "title": "Privacy",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Your use of Zionra is governed by our Privacy Policy."
          }
        ]
      },
      {
        "number": 16,
        "title": "Changes to Terms",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Zionra may update these Terms at any time."
          },
          {
            "type": "paragraph",
            "text": "Updated terms will be posted on our platform."
          }
        ]
      },
      {
        "number": 17,
        "title": "Governing Law",
        "blocks": [
          {
            "type": "paragraph",
            "text": "These Terms are governed by the laws of England and Wales."
          }
        ]
      },
      {
        "number": 18,
        "title": "Contact Us",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Email: hello@zionra.com"
          },
          {
            "type": "paragraph",
            "text": "Website: www.zionra.com"
          },
          {
            "type": "paragraph",
            "text": "WhatsApp: [Insert Number]"
          },
          {
            "type": "paragraph",
            "text": "By using Zionra, you acknowledge that you have read and agreed to these Terms & Conditions."
          }
        ]
      }
    ]
  },
  "refund": {
    "title": "ZIONRA REFUND POLICY",
    "preamble": [
      {
        "type": "paragraph",
        "text": "Effective Date: [Insert Date]"
      },
      {
        "type": "paragraph",
        "text": "Last Updated: [Insert Date]"
      },
      {
        "type": "paragraph",
        "text": "This Refund Policy explains when customers may be eligible for refunds when booking shipments through Zionra."
      },
      {
        "type": "paragraph",
        "text": "Zionra is a technology-enabled marketplace platform that connects customers with independent shipping agents. Zionra is not the direct shipping carrier."
      },
      {
        "type": "paragraph",
        "text": "By using Zionra, you agree to this Refund Policy."
      }
    ],
    "sections": [
      {
        "number": 1,
        "title": "Refund Eligibility",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Customers may be eligible for a full or partial refund in the following situations:"
          },
          {
            "type": "subheading",
            "text": "A. Failed Pickup"
          },
          {
            "type": "paragraph",
            "text": "If the selected shipping agent fails to collect the package within the agreed pickup window and no alternative arrangement is made."
          },
          {
            "type": "subheading",
            "text": "B. Duplicate Payment"
          },
          {
            "type": "paragraph",
            "text": "If a customer is charged more than once for the same shipment."
          },
          {
            "type": "subheading",
            "text": "C. Agent Cancellation"
          },
          {
            "type": "paragraph",
            "text": "If a shipping agent cancels a confirmed shipment before the package has been collected."
          },
          {
            "type": "subheading",
            "text": "D. Major Service Failure"
          },
          {
            "type": "paragraph",
            "text": "If Zionra determines that there was a significant service failure, such as:"
          },
          {
            "type": "list",
            "text": "package never collected"
          },
          {
            "type": "list",
            "text": "shipment never dispatched"
          },
          {
            "type": "list",
            "text": "confirmed service not provided"
          },
          {
            "type": "subheading",
            "text": "E. Approved Shipment Protection Claims"
          },
          {
            "type": "paragraph",
            "text": "Where applicable, approved claims for lost or severely damaged shipments may qualify for compensation under Zionra’s Shipment Protection Policy."
          }
        ]
      },
      {
        "number": 2,
        "title": "Non-Refundable Situations",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Refunds will NOT be provided in the following situations:"
          },
          {
            "type": "list",
            "text": "customer provides incorrect address information"
          },
          {
            "type": "list",
            "text": "customer provides incorrect recipient information"
          },
          {
            "type": "list",
            "text": "customer cancels after package has been collected"
          },
          {
            "type": "list",
            "text": "customs delays"
          },
          {
            "type": "list",
            "text": "customs seizures"
          },
          {
            "type": "list",
            "text": "prohibited or contraband goods"
          },
          {
            "type": "list",
            "text": "force majeure events"
          },
          {
            "type": "list",
            "text": "dissatisfaction with estimated delivery times where shipment was completed"
          }
        ]
      },
      {
        "number": 3,
        "title": "Zionra Service Fee Refunds",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Zionra’s Service & Protection Fee may be refunded when:"
          },
          {
            "type": "list",
            "text": "no shipment takes place"
          },
          {
            "type": "list",
            "text": "payment errors occur"
          },
          {
            "type": "list",
            "text": "Zionra determines a refund is appropriate"
          },
          {
            "type": "paragraph",
            "text": "Zionra’s service fee may not be refunded once shipment processing has begun."
          }
        ]
      },
      {
        "number": 4,
        "title": "Agent Shipping Fee Refunds",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Agent shipping fees and handling fees may be refunded depending on:"
          },
          {
            "type": "list",
            "text": "whether collection occurred"
          },
          {
            "type": "list",
            "text": "whether shipment was dispatched"
          },
          {
            "type": "list",
            "text": "the specific circumstances of the dispute"
          },
          {
            "type": "paragraph",
            "text": "Zionra may coordinate discussions between customers and shipping agents but final outcomes may depend on investigation results."
          }
        ]
      },
      {
        "number": 5,
        "title": "Lost or Damaged Shipments",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Customers must report lost or damaged shipments within 7 days of delivery."
          },
          {
            "type": "paragraph",
            "text": "Customers may be asked to provide:"
          },
          {
            "type": "list",
            "text": "shipment tracking details"
          },
          {
            "type": "list",
            "text": "proof of damage"
          },
          {
            "type": "list",
            "text": "package photos"
          },
          {
            "type": "list",
            "text": "supporting documentation"
          },
          {
            "type": "paragraph",
            "text": "Claims are reviewed on a case-by-case basis."
          }
        ]
      },
      {
        "number": 6,
        "title": "Refund Request Process",
        "blocks": [
          {
            "type": "paragraph",
            "text": "To request a refund, customers should contact:"
          },
          {
            "type": "paragraph",
            "text": "hello@zionra.com"
          },
          {
            "type": "paragraph",
            "text": "WhatsApp Support: [Insert Number]"
          },
          {
            "type": "paragraph",
            "text": "Please include:"
          },
          {
            "type": "list",
            "text": "booking reference number"
          },
          {
            "type": "list",
            "text": "shipment details"
          },
          {
            "type": "list",
            "text": "reason for refund request"
          },
          {
            "type": "list",
            "text": "supporting evidence (if applicable)"
          }
        ]
      },
      {
        "number": 7,
        "title": "Refund Processing Timeline",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Approved refunds are typically processed within:"
          },
          {
            "type": "paragraph",
            "text": "5–10 business days"
          },
          {
            "type": "paragraph",
            "text": "Processing times may vary depending on payment providers such as Stripe."
          }
        ]
      },
      {
        "number": 8,
        "title": "Fraudulent Refund Requests",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Zionra reserves the right to deny refund requests where:"
          },
          {
            "type": "list",
            "text": "fraud is suspected"
          },
          {
            "type": "list",
            "text": "false claims are submitted"
          },
          {
            "type": "list",
            "text": "misleading information is provided"
          },
          {
            "type": "paragraph",
            "text": "Accounts involved in refund abuse may be suspended."
          }
        ]
      },
      {
        "number": 9,
        "title": "Policy Changes",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Zionra may update this Refund Policy at any time."
          },
          {
            "type": "paragraph",
            "text": "Updated versions will be posted on our platform."
          }
        ]
      },
      {
        "number": 10,
        "title": "Contact Us",
        "blocks": [
          {
            "type": "paragraph",
            "text": "For refund-related issues:"
          },
          {
            "type": "paragraph",
            "text": "Email: support@zionra.com"
          },
          {
            "type": "paragraph",
            "text": "Website: www.zionra.com"
          },
          {
            "type": "paragraph",
            "text": "By using Zionra, you acknowledge that you have read and agreed to this Refund Policy."
          }
        ]
      }
    ]
  }
};
