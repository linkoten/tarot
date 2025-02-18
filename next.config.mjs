/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
                pathname: '**'
            },
            {
                protocol: "https",
                hostname: 'i.ibb.co',
                pathname: '**'
            }
        ]
    }
};


export default nextConfig;
