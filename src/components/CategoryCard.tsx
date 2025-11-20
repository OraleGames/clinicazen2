import React from 'react';
import Link from 'next/link';

interface CategoryCardProps {
    name: string;
    description: string;
    image: string;
    link: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, description, image, link }) => {
    return (
        <Link href={link} className="block">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
                <img src={image} alt={name} className="w-full h-48 object-cover" />
                <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{name}</h3>
                    <p className="text-gray-600">{description}</p>
                </div>
            </div>
        </Link>
    );
};

export default CategoryCard;
