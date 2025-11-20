import React from 'react';
import Link from 'next/link';

interface BlogCardProps {
    title: string;
    excerpt: string;
    image: string;
    link: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ title, excerpt, image, link }) => {
    return (
        <Link href={link} className="block">
            <div className="bg-white rounded-lg shadow-lg border-purple-500 border-2 overflow-hidden h-full">
                <img src={image} alt={title} className="w-full h-48 object-cover" />
                <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-gray-600">{excerpt}</p>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;
