import type { Metadata } from 'next'
import './globals.css'
import Providers from '../components/Providers'

export const metadata: Metadata = {
  title: 'FitChallenger: Create Custom Fitness Challenges & Engage Your Friends',
  description: 'Unleash your competitive spirit with FitChallenger – a unique platform where you design personalized fitness challenges, challenge friends, and redefine your workout routine. Join the movement and transform your fitness journey today!',
  openGraph: {
    title: 'FitChallenger: Create Custom Fitness Challenges & Engage Your Friends',
    description: 'Unleash your competitive spirit with FitChallenger – a unique platform where you design personalized fitness challenges, challenge friends, and redefine your workout routine.',
    images: [
      {
        url: 'https://res.cloudinary.com/dopcbgrcs/image/upload/c_fill,w_1200,h_630/v1743333597/fitchallenger-app_futccf.jpg',
        width: 1200,
        height: 630,
        alt: 'FitChallenger App Preview'
      },
      {
        url: 'https://res.cloudinary.com/dopcbgrcs/image/upload/c_fill,w_1200,h_1200/v1743333597/fitchallenger-app_futccf.jpg',
        width: 1200,
        height: 1200,
        alt: 'FitChallenger App Preview'
      },
      {
        url: 'https://res.cloudinary.com/dopcbgrcs/image/upload/c_fill,w_1200,h_627/v1743333597/fitchallenger-app_futccf.jpg',
        width: 1200,
        height: 627,
        alt: 'FitChallenger App Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitChallenger: Create Custom Fitness Challenges & Engage Your Friends',
    description: 'Unleash your competitive spirit with FitChallenger – a unique platform where you design personalized fitness challenges, challenge friends, and redefine your workout routine.',
    images: ['https://res.cloudinary.com/dopcbgrcs/image/upload/c_fill,w_1200,h_1200/v1743333597/fitchallenger-app_futccf.jpg']
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
