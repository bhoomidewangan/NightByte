import Navbar from "./Navbar";

function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default CustomerLayout;