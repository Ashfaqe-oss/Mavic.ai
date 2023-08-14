/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "googleusercontent.com",
            "oaidalleapiprodscus.blob.core.windows.net",
            "cdn.openai.com",
            "pbxt.replicate.delivery",
            "replicate.delivery",
            "res.cloudinary.com"
        ]
    },
}

module.exports = nextConfig