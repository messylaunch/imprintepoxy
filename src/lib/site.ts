export const site = {
  name: "Imprint Epoxy Design",
  short: "Imprint Epoxy",
  tagline: "Leave your mark. Seal it forever.",
  // Hero footage (generated with Higgsfield from the real Ponds table photo).
  // Set to null to fall back to the animated CSS pour.
  heroVideo: {
    desktop: "/media/gen/hero-pour.mp4",
    mobile: "/media/gen/hero-pour-mobile.mp4",
    poster: "/media/gen/hero-pour-poster.webp",
    posterMobile: "/media/gen/hero-pour-mobile-poster.webp",
  } as { desktop: string; mobile: string; poster: string; posterMobile: string } | null,
  phone: "(863) 999-1182",
  phoneHref: "tel:+18639991182",
  smsHref: "sms:+18639991182",
  email: "imprintepoxydesign@gmail.com",
  emailHref: "mailto:imprintepoxydesign@gmail.com",
  instagram: "https://instagram.com/",
  imprintUrl: "/imprint",
};

export const US_STATES = "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");
