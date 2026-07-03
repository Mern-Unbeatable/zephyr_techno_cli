import React from 'react';
import { Link } from 'react-router';
import newPhone from '../../../assets/banner/newPhone2.png';
import usedPhone from '../../../assets/banner/usedPhone1.png';
import Container from '../../../layout/Container';

const Category = () => {
    return (
        <section className="py-10 lg:py-16">
            <Container>
                <div className="text-center">
                    <h2 className="title-custom">Explore Categories</h2>
                    <p className="subtitle-custom mt-1">
                        Find the perfect device that fits your budget and style.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="relative overflow-hidden rounded-xl">
                        <img
                            src={newPhone}
                            alt="New phones"
                            className="block w-full h-auto"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                            <Link
                                to='/products?filter=NEW'
                                className="inline-flex cursor-pointer hover:scale-105 transform transition-all duration-300 items-center rounded-lg bg-custom px-4 py-2 text-xs md:text-sm font-semibold text-white"
                            >
                                Browse New
                            </Link>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl">
                        <img
                            src={usedPhone}
                            alt="Used phones"
                            className="block w-full h-auto"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                            <Link
                                to='/products?filter=USED'
                                className="inline-flex items-center rounded-lg bg-custom px-4 py-2 text-xs md:text-sm font-semibold text-white cursor-pointer hover:scale-105 transform transition-all duration-300"
                            >
                                Browse Used
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default Category;