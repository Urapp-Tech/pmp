// import { Loader } from 'lucide-react';

import React from 'react';
const Loader: React.FC = () => {
    return (
        <div id="async-loader" className="async-loader bg-black">
            <div className="spinner"></div>
        </div>
    );
};

export default Loader;