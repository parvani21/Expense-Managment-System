import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
    return (
      <>
        <Header />
        <div className="content">
            {children}  {/* Corrected to use lowercase 'children' */}
        </div>
        <Footer />
      </>
    );
};

export default Layout;
