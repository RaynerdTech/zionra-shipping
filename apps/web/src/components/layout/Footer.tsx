const logoZionra = "/images/logo-zionra.png";

type FooterLinkGroup = {
  title: string;
  links: string[];
};

const footerGroups: FooterLinkGroup[] = [
  {
    title: "Company",
    links: ["Get Quote", "About Us"],
  },
  {
    title: "Services",
    links: ["How It Works", "Track Shipment", "Become an Agent"],
  },
  {
    title: "Support",
    links: ["Help Center", "Contact Us", "FAQs"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
];

const socialLinks = ["Twitter/X", "Instagram", "LinkedIn", "Facebook"];

function Footer() {
  return (
    <footer className="w-full border-t border-neutral-03 bg-primary-10 font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-[34px] pt-[36px] lg:px-[72px] lg:pb-[36px] lg:pt-[38px]">
        <div className="grid gap-[34px]">
          <div>
            <a href="#" className="inline-flex flex-col items-start">
              <img
                src={logoZionra}
                alt="Zionra logo"
                className="h-[34px] w-auto object-contain"
              />

              <span className="mt-[7px] font-sans text-[14px] font-semibold leading-none text-white">
                Zionra
              </span>
            </a>

            <p className="mt-[7px] max-w-[180px] font-sans text-[13px] font-light leading-[1.35] text-neutral-05">
              Ship smarter. Every time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-[34px] gap-y-[30px] md:grid-cols-4 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <FooterColumn key={group.title} group={group} />
            ))}
          </div>
        </div>

        <div className="mt-[64px] h-px w-full bg-primary-06/30 md:mt-[82px] lg:mt-[94px]" />

        <div className="mt-[20px] flex flex-col gap-[18px] md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[13px] font-light leading-none text-neutral-05">
            © 2025 Zionra Ltd. All rights reserved.
          </p>

          <nav aria-label="Social links">
            <ul className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px]">
              {socialLinks.map((link, index) => (
                <li key={link} className="flex items-center gap-[12px]">
                  <a
                    href="#"
                    className="font-sans text-[13px] font-light leading-none text-neutral-05 transition-colors hover:text-white"
                  >
                    {link}
                  </a>

                  {index !== socialLinks.length - 1 ? (
                    <span className="h-[3px] w-[3px] rounded-full bg-neutral-05/70" />
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ group }: { group: FooterLinkGroup }) {
  return (
    <div>
      <h3 className="font-sans text-[14px] font-semibold leading-none text-white">
        {group.title}
      </h3>

      <ul className="mt-[18px] space-y-[14px]">
        {group.links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="font-sans text-[13px] font-light leading-none text-neutral-05 transition-colors hover:text-white"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
