/** Copy from the supplied desktop/mobile Support HTML prototypes. */
export const supportTopics = [
  {
    "title": "Booking & quotes",
    "description": "Comparing, quoting and booking your shipment",
    "count": "12 questions"
  },
  {
    "title": "Delivery & tracking",
    "description": "Shipment visibility, delivery updates and issue resolution",
    "count": "12 questions"
  },
  {
    "title": "Payments & refunds",
    "description": "Charges, payment processing, refunds and payment issues",
    "count": "14 questions"
  },
  {
    "title": "Insurance & claims",
    "description": "Shipment protection, declared value and claims",
    "count": "15 questions"
  },
  {
    "title": "Customs & prohibited items",
    "description": "What you can send, customs processing, duties and held parcels",
    "count": "17 questions"
  },
  {
    "title": "Your account",
    "description": "Sign-in, verification, addresses and account details",
    "count": "14 questions"
  },
  {
    "title": "Shipping partners",
    "description": "Our trusted shipping partners and how Zionra works with them",
    "count": "15 questions"
  },
  {
    "title": "Trust & safety",
    "description": "How Zionra verifies partners and keeps customers and shipments safe",
    "count": "14 questions"
  }
] as const;

export const supportQuestions = [
  {
    "question": "My tracking hasn’t updated in a few days — is something wrong?",
    "answer": "Usually not. Tracking often goes quiet during the sea or air leg and again while a parcel sits with customs, which can take several days. If there’s been no movement for more than 7 working days, message your agent from the shipment page — and if they don’t reply within 48 hours, escalate to us."
  },
  {
    "question": "What can’t I send to Nigeria?",
    "answer": "Restricted items include batteries and power banks shipped loose, aerosols, perishable food, medicines without a prescription, currency, and used clothing in commercial quantities. Individual agents may restrict more. Check the prohibited items list before you book — a parcel stopped at customs can’t always be returned."
  },
  {
    "question": "Who pays customs duties?",
    "answer": "Duties are charged by Nigerian customs and aren’t included in your Zionra quote. Depending on the agent and service you chose, they’re either paid by the recipient on delivery or invoiced to you afterwards. Your booking confirmation states which applies."
  },
  {
    "question": "How does insurance work?",
    "answer": "Cover is optional and costs 10% of the value you declare at booking. It covers loss or damage in transit up to that declared value. Claims are raised through Zionra, not the agent, and need photos plus your original receipt or proof of value."
  },
  {
    "question": "Can I get a refund if I cancel?",
    "answer": "If you cancel before the agent collects, you’re refunded the shipping cost. The service charge is non-refundable once a booking is confirmed. After collection, cancellation depends on where the parcel has reached — contact us and we’ll tell you what’s recoverable."
  },
  {
    "question": "What happens if nobody pays on delivery?",
    "answer": "The parcel is held at the agent’s depot and we’ll contact you. There’s a grace period before storage charges start. If it stays unclaimed, you can pay for return to sender or authorise disposal. The amount you already paid at booking isn’t refunded in either case."
  }
] as const;

export const supportResponsibilities = [
  {
    "title": "Zionra handles",
    "items": [
      "Payments, refunds and billing disputes",
      "Agent verification and removing bad actors",
      "Your account, data and login",
      "Insurance claims raised through the platform",
      "Stepping in when an agent stops responding"
    ]
  },
  {
    "title": "Your shipping agent handles",
    "items": [
      "Collection times and pickup arrangements",
      "Packing requirements and item restrictions",
      "Customs paperwork and clearance",
      "Final-mile delivery and recipient contact",
      "Day-to-day updates on your shipment"
    ]
  }
] as const;
