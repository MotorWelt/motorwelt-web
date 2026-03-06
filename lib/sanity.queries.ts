export const LISTINGS_BY_TYPE_QUERY = `
  *[_type == "marketListing" && type == $type && isPublic == true]
  | order(publishedAt desc, _createdAt desc) {
    _id,
    type,
    title,
    subtitle,
    "slug": slug.current,
    year,
    price,
    km,
    location,
    status,
    tags,
    gallery
  }
`;

export const LISTING_BY_SLUG_QUERY = `
  *[_type == "marketListing" && type == $type && slug.current == $slug && isPublic == true][0]{
    _id,
    type,
    title,
    subtitle,
    "slug": slug.current,
    year,
    price,
    km,
    location,
    status,
    tags,
    specs,
    gallery
  }
`;

export const LISTING_SLUGS_BY_TYPE_QUERY = `
  *[_type == "marketListing" && type == $type && isPublic == true && defined(slug.current)]{
    "slug": slug.current
  }
`;
