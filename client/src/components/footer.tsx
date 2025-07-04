import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="amazon-navy text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Get to Know Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Press Releases
                </Link>
              </li>
              <li>
                <Link href="/investors" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Investor Relations
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Make Money with Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sell" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Sell Products
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Become an Affiliate
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Advertise Your Products
                </Link>
              </li>
              <li>
                <Link href="/publish" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Self-Publish
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Payment Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/points" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Shop with Points
                </Link>
              </li>
              <li>
                <Link href="/reload" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Reload Balance
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/currency" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Currency Converter
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Let Us Help You</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Your Account
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Your Orders
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Shipping Rates
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[hsl(35,100%,50%)] transition-colors">
                  Returns & Replacements
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[hsl(185,100%,30%)] mt-8 pt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-xl font-bold">ShopCenter</h2>
          </div>
          <p className="text-sm text-gray-300">
            &copy; 2024 ShopCenter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
