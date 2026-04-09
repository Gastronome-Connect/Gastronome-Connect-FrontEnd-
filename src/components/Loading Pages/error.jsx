import React from "react";
import Logo from "../Assets/error_404.gif";
import Logo2 from "../Assets/FoodAI.png";

function LoadingPage() {
return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <img
                src={Logo2}
                alt="Logo2"
                className="w-36 sm:w-32 md:w-80 object-contain mb-6"
            />
            <img
                src={Logo}
                alt="Logo"
                className="w-48 sm:w-64 md:w-70 object-contain"
            />
            <h1 className="text-2xl font-semibold text-center text-green-600 mt-8">
                Oops! Something went wrong.
                </h1>
            <p className="text-lg text-center text-gray-600 mt-2">
                We couldn't find the page you were looking for.
            </p>
            <p className="text-lg text-center text-gray-600 mt-2">
                Please try again later.
            </p>
        </div>
    </div>
);
}

export default LoadingPage;