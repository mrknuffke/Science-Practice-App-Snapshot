import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    name = 'Science Practice Partner',
    type = 'website',
    image = '/banner.png',
    url = 'https://sciencepractice.app/'
}) => {
    const siteTitle = title ? `${title} | ${name}` : name;
    const metaDescription = description || "Science Supports for Science Students";

    // Ensure image is absolute if it's a relative path and we have a base URL, 
    // but for OG tags, absolute URLs are best.
    // If the image prop starts with '/', append it to the site URL (minus trailing slash)
    const fullImageUrl = image && image.startsWith('/')
        ? `${url.replace(/\/$/, '')}${image}`
        : image;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name='description' content={metaDescription} />

            {/* Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:url" content={url} />

            {/* Twitter tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={fullImageUrl} />
        </Helmet>
    );
}

export default SEO;
