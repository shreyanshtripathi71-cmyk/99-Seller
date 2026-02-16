'use client'
import "../styles/index.scss";
import { Provider } from "react-redux";
import store from "@/redux/store";
import Wrapper from "@/layouts/Wrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="en" suppressHydrationWarning={isDev}>
      <head>
        <meta name="keywords" content="Real estate, Off-market leads, Distressed property, Foreclosures, Investor data" />
        <meta name="description" content="99Sellers - The #1 Platform for Off-Market Real Estate Leads. Find Foreclosures, Tax Defaults, and Divorce listings instantly." />
        <meta property="og:site_name" content="99Sellers" />
        <meta property="og:url" content="https://99sellers.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="99Sellers - Investor Data & Off-Market Leads" />

        {/* You can update this image later with your own OpenGraph image */}
        <meta name='og:image' content='images/assets/ogg.png' />

        {/* For IE  */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* For Resposive Device */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* For Window Tab Color */}
        {/* Chrome, Firefox OS and Opera */}
        <meta name="theme-color" content="#0D1A1C" />
        {/* Windows Phone */}
        <meta name="msapplication-navbutton-color" content="#0D1A1C" />
        {/* iOS Safari */}
        <meta name="apple-mobile-web-app-status-bar-style" content="#0D1A1C" />

        <link rel="icon" href="/favicon.png" sizes="any" />

        {/* Notion 3.0 Typography (Inter) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* Keep the fonts or change them if you have a specific brand font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap" />
      </head>
      <body suppressHydrationWarning={true}>
        <div className="main-page-wrapper">
          {/* This Provider is CRITICAL for your Lead Search Table to work */}
          <Provider store={store}>
            <Wrapper>
              {children}
            </Wrapper>
          </Provider>
        </div>
      </body>
    </html>
  )
}