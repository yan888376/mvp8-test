"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { FeaturedProducts } from "@/components/featured-products"
import { SearchAndFilters } from "@/components/search-and-filters"
import { UltraCompactSiteGrid } from "@/components/ultra-compact-site-grid"
import { AddSiteModal } from "@/components/add-site-modal"
import { UpgradeModal } from "@/components/upgrade-modal"
import { Toast } from "@/components/toast"
import { Button } from "@/components/ui/button"
import { Shuffle, Plus, Crown } from "lucide-react"

export default function WebHub() {
  const [sites, setSites] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isShuffled, setIsShuffled] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState({ type: "guest", customCount: 0, pro: false })
  const [isGuestTimeExpired, setIsGuestTimeExpired] = useState(false)
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    // Load sites from localStorage or default
    const savedSites = localStorage.getItem("webhub-sites")
    const savedShuffle = localStorage.getItem("webhub-shuffle")
    const savedFavorites = localStorage.getItem("webhub-favorites")

    if (savedSites) {
      setSites(JSON.parse(savedSites))
    } else {
      setSites(getDefaultSites())
    }

    if (savedShuffle) {
      setIsShuffled(JSON.parse(savedShuffle))
    }

    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    // Check if guest time is already expired
    if (user.type === "guest") {
      const startTime = localStorage.getItem("guest-start-time")
      if (startTime) {
        const elapsed = Math.floor((Date.now() - Number.parseInt(startTime)) / 1000)
        if (elapsed >= 600) {
          setIsGuestTimeExpired(true)
        }
      }
    }
  }, [user.type])

  // Save data with user-specific keys for authenticated users
  const saveUserData = (key: string, data: any) => {
    if (user.type === "authenticated") {
      const userKey = `${key}-${user.email}`
      localStorage.setItem(userKey, JSON.stringify(data))
    } else {
      localStorage.setItem(key, JSON.stringify(data))
    }
  }

  const loadUserData = (key: string) => {
    if (user.type === "authenticated") {
      const userKey = `${key}-${user.email}`
      return localStorage.getItem(userKey)
    } else {
      return localStorage.getItem(key)
    }
  }

  const getDefaultSites = () => [
    // 20 MornHub Featured products
    {
      id: "mornhub-lat",
      name: "MornHub",
      url: "https://mornhub.lat",
      logo: "🌅",
      featured: true,
      custom: false,
      category: "tools",
    },
    {
      id: "mornhub-homes",
      name: "MornHomes",
      url: "https://mornhub.homes",
      logo: "🏠",
      featured: true,
      custom: false,
      category: "tools",
    },
    {
      id: "mornhub-tech",
      name: "MornTech",
      url: "https://mornhub.tech",
      logo: "⚡",
      featured: true,
      custom: false,
      category: "tools",
    },
    {
      id: "mornhub-live",
      name: "MornLive",
      url: "https://mornhub.live",
      logo: "📺",
      featured: true,
      custom: false,
      category: "video",
    },
    {
      id: "mornhub-shop",
      name: "MornShop",
      url: "https://mornhub.shop",
      logo: "🛒",
      featured: true,
      custom: false,
      category: "shopping",
    },
    {
      id: "mornhub-news",
      name: "MornNews",
      url: "https://mornhub.news",
      logo: "📰",
      featured: true,
      custom: false,
      category: "news",
    },
    {
      id: "mornhub-finance",
      name: "MornFinance",
      url: "https://mornhub.finance",
      logo: "💰",
      featured: true,
      custom: false,
      category: "finance",
    },
    {
      id: "mornhub-learn",
      name: "MornLearn",
      url: "https://mornhub.learn",
      logo: "🎓",
      featured: true,
      custom: false,
      category: "education",
    },
    {
      id: "mornhub-design",
      name: "MornDesign",
      url: "https://mornhub.design",
      logo: "🎨",
      featured: true,
      custom: false,
      category: "design",
    },
    {
      id: "mornhub-social",
      name: "MornSocial",
      url: "https://mornhub.social",
      logo: "👥",
      featured: true,
      custom: false,
      category: "social",
    },
    {
      id: "mornhub-music",
      name: "MornMusic",
      url: "https://mornhub.music",
      logo: "🎵",
      featured: true,
      custom: false,
      category: "music",
    },
    {
      id: "mornhub-travel",
      name: "MornTravel",
      url: "https://mornhub.travel",
      logo: "✈️",
      featured: true,
      custom: false,
      category: "travel",
    },
    {
      id: "mornhub-food",
      name: "MornFood",
      url: "https://mornhub.food",
      logo: "🍔",
      featured: true,
      custom: false,
      category: "food",
    },
    {
      id: "mornhub-health",
      name: "MornHealth",
      url: "https://mornhub.health",
      logo: "💪",
      featured: true,
      custom: false,
      category: "health",
    },
    {
      id: "mornhub-games",
      name: "MornGames",
      url: "https://mornhub.games",
      logo: "🎮",
      featured: true,
      custom: false,
      category: "gaming",
    },
    {
      id: "mornhub-work",
      name: "MornWork",
      url: "https://mornhub.work",
      logo: "💼",
      featured: true,
      custom: false,
      category: "productivity",
    },
    {
      id: "mornhub-ai",
      name: "MornAI",
      url: "https://mornhub.ai",
      logo: "🤖",
      featured: true,
      custom: false,
      category: "tools",
    },
    {
      id: "mornhub-crypto",
      name: "MornCrypto",
      url: "https://mornhub.crypto",
      logo: "₿",
      featured: true,
      custom: false,
      category: "finance",
    },
    {
      id: "mornhub-cloud",
      name: "MornCloud",
      url: "https://mornhub.cloud",
      logo: "☁️",
      featured: true,
      custom: false,
      category: "tools",
    },
    {
      id: "mornhub-mobile",
      name: "MornMobile",
      url: "https://mornhub.mobile",
      logo: "📱",
      featured: true,
      custom: false,
      category: "tools",
    },

    // 300+ Global Sites - Comprehensive List
    // Search Engines & Browsers
    { id: "google", name: "Google", url: "https://google.com", logo: "🔍", custom: false, category: "tools" },
    { id: "bing", name: "Bing", url: "https://bing.com", logo: "🔍", custom: false, category: "tools" },
    { id: "yahoo", name: "Yahoo", url: "https://yahoo.com", logo: "🌐", custom: false, category: "tools" },
    {
      id: "duckduckgo",
      name: "DuckDuckGo",
      url: "https://duckduckgo.com",
      logo: "🦆",
      custom: false,
      category: "tools",
    },
    { id: "baidu", name: "Baidu", url: "https://baidu.com", logo: "🔍", custom: false, category: "tools" },
    { id: "yandex", name: "Yandex", url: "https://yandex.com", logo: "🔍", custom: false, category: "tools" },

    // Social Media & Communication
    { id: "facebook", name: "Facebook", url: "https://facebook.com", logo: "👥", custom: false, category: "social" },
    { id: "instagram", name: "Instagram", url: "https://instagram.com", logo: "📸", custom: false, category: "social" },
    { id: "twitter", name: "Twitter", url: "https://twitter.com", logo: "🐦", custom: false, category: "social" },
    { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com", logo: "💼", custom: false, category: "social" },
    { id: "tiktok", name: "TikTok", url: "https://tiktok.com", logo: "🎵", custom: false, category: "social" },
    { id: "snapchat", name: "Snapchat", url: "https://snapchat.com", logo: "👻", custom: false, category: "social" },
    { id: "pinterest", name: "Pinterest", url: "https://pinterest.com", logo: "📌", custom: false, category: "social" },
    { id: "reddit", name: "Reddit", url: "https://reddit.com", logo: "🤖", custom: false, category: "social" },
    { id: "discord", name: "Discord", url: "https://discord.com", logo: "🎮", custom: false, category: "social" },
    { id: "telegram", name: "Telegram", url: "https://telegram.org", logo: "✈️", custom: false, category: "social" },
    {
      id: "whatsapp",
      name: "WhatsApp",
      url: "https://web.whatsapp.com",
      logo: "💬",
      custom: false,
      category: "social",
    },
    { id: "wechat", name: "WeChat", url: "https://web.wechat.com", logo: "💬", custom: false, category: "social" },
    { id: "line", name: "LINE", url: "https://line.me", logo: "💬", custom: false, category: "social" },
    { id: "viber", name: "Viber", url: "https://viber.com", logo: "💬", custom: false, category: "social" },
    { id: "skype", name: "Skype", url: "https://skype.com", logo: "📞", custom: false, category: "social" },

    // Video & Streaming
    { id: "youtube", name: "YouTube", url: "https://youtube.com", logo: "📺", custom: false, category: "video" },
    { id: "netflix", name: "Netflix", url: "https://netflix.com", logo: "🎬", custom: false, category: "video" },
    { id: "hulu", name: "Hulu", url: "https://hulu.com", logo: "📺", custom: false, category: "video" },
    { id: "disney", name: "Disney+", url: "https://disneyplus.com", logo: "🏰", custom: false, category: "video" },
    { id: "hbo", name: "HBO Max", url: "https://hbomax.com", logo: "🎭", custom: false, category: "video" },
    {
      id: "amazon-prime",
      name: "Prime Video",
      url: "https://primevideo.com",
      logo: "📺",
      custom: false,
      category: "video",
    },
    { id: "twitch", name: "Twitch", url: "https://twitch.tv", logo: "🎮", custom: false, category: "video" },
    { id: "vimeo", name: "Vimeo", url: "https://vimeo.com", logo: "🎥", custom: false, category: "video" },
    {
      id: "dailymotion",
      name: "Dailymotion",
      url: "https://dailymotion.com",
      logo: "📺",
      custom: false,
      category: "video",
    },
    { id: "bilibili", name: "Bilibili", url: "https://bilibili.com", logo: "📺", custom: false, category: "video" },
    { id: "youku", name: "Youku", url: "https://youku.com", logo: "📺", custom: false, category: "video" },

    // E-commerce & Shopping
    { id: "amazon", name: "Amazon", url: "https://amazon.com", logo: "📦", custom: false, category: "shopping" },
    { id: "ebay", name: "eBay", url: "https://ebay.com", logo: "🛒", custom: false, category: "shopping" },
    { id: "alibaba", name: "Alibaba", url: "https://alibaba.com", logo: "🛒", custom: false, category: "shopping" },
    {
      id: "aliexpress",
      name: "AliExpress",
      url: "https://aliexpress.com",
      logo: "🛒",
      custom: false,
      category: "shopping",
    },
    { id: "etsy", name: "Etsy", url: "https://etsy.com", logo: "🛍️", custom: false, category: "shopping" },
    { id: "shopify", name: "Shopify", url: "https://shopify.com", logo: "🛍️", custom: false, category: "shopping" },
    { id: "walmart", name: "Walmart", url: "https://walmart.com", logo: "🛒", custom: false, category: "shopping" },
    { id: "target", name: "Target", url: "https://target.com", logo: "🎯", custom: false, category: "shopping" },
    { id: "bestbuy", name: "Best Buy", url: "https://bestbuy.com", logo: "🛒", custom: false, category: "shopping" },
    { id: "costco", name: "Costco", url: "https://costco.com", logo: "🛒", custom: false, category: "shopping" },
    { id: "taobao", name: "Taobao", url: "https://taobao.com", logo: "🛒", custom: false, category: "shopping" },
    { id: "jd", name: "JD.com", url: "https://jd.com", logo: "🛒", custom: false, category: "shopping" },
    { id: "rakuten", name: "Rakuten", url: "https://rakuten.com", logo: "🛒", custom: false, category: "shopping" },
    {
      id: "mercadolibre",
      name: "MercadoLibre",
      url: "https://mercadolibre.com",
      logo: "🛒",
      custom: false,
      category: "shopping",
    },

    // News & Media
    { id: "cnn", name: "CNN", url: "https://cnn.com", logo: "📺", custom: false, category: "news" },
    { id: "bbc", name: "BBC", url: "https://bbc.com", logo: "📺", custom: false, category: "news" },
    { id: "nytimes", name: "NY Times", url: "https://nytimes.com", logo: "📰", custom: false, category: "news" },
    {
      id: "guardian",
      name: "The Guardian",
      url: "https://theguardian.com",
      logo: "📰",
      custom: false,
      category: "news",
    },
    { id: "reuters", name: "Reuters", url: "https://reuters.com", logo: "📰", custom: false, category: "news" },
    { id: "wsj", name: "Wall Street Journal", url: "https://wsj.com", logo: "📈", custom: false, category: "news" },
    {
      id: "washingtonpost",
      name: "Washington Post",
      url: "https://washingtonpost.com",
      logo: "📰",
      custom: false,
      category: "news",
    },
    { id: "forbes", name: "Forbes", url: "https://forbes.com", logo: "💰", custom: false, category: "news" },
    { id: "bloomberg", name: "Bloomberg", url: "https://bloomberg.com", logo: "📈", custom: false, category: "news" },
    {
      id: "techcrunch",
      name: "TechCrunch",
      url: "https://techcrunch.com",
      logo: "💻",
      custom: false,
      category: "news",
    },
    { id: "verge", name: "The Verge", url: "https://theverge.com", logo: "📱", custom: false, category: "news" },
    { id: "wired", name: "Wired", url: "https://wired.com", logo: "🔌", custom: false, category: "news" },
    { id: "engadget", name: "Engadget", url: "https://engadget.com", logo: "📱", custom: false, category: "news" },
    { id: "medium", name: "Medium", url: "https://medium.com", logo: "📝", custom: false, category: "news" },
    { id: "buzzfeed", name: "BuzzFeed", url: "https://buzzfeed.com", logo: "🐝", custom: false, category: "news" },

    // Finance & Banking
    { id: "paypal", name: "PayPal", url: "https://paypal.com", logo: "💳", custom: false, category: "finance" },
    { id: "stripe", name: "Stripe", url: "https://stripe.com", logo: "💳", custom: false, category: "finance" },
    { id: "coinbase", name: "Coinbase", url: "https://coinbase.com", logo: "₿", custom: false, category: "finance" },
    { id: "binance", name: "Binance", url: "https://binance.com", logo: "₿", custom: false, category: "finance" },
    {
      id: "robinhood",
      name: "Robinhood",
      url: "https://robinhood.com",
      logo: "📈",
      custom: false,
      category: "finance",
    },
    { id: "etrade", name: "E*TRADE", url: "https://etrade.com", logo: "📊", custom: false, category: "finance" },
    { id: "chase", name: "Chase", url: "https://chase.com", logo: "🏦", custom: false, category: "finance" },
    {
      id: "bankofamerica",
      name: "Bank of America",
      url: "https://bankofamerica.com",
      logo: "🏦",
      custom: false,
      category: "finance",
    },
    {
      id: "wells-fargo",
      name: "Wells Fargo",
      url: "https://wellsfargo.com",
      logo: "🏦",
      custom: false,
      category: "finance",
    },
    { id: "venmo", name: "Venmo", url: "https://venmo.com", logo: "💸", custom: false, category: "finance" },
    { id: "cashapp", name: "Cash App", url: "https://cash.app", logo: "💸", custom: false, category: "finance" },
    { id: "alipay", name: "Alipay", url: "https://alipay.com", logo: "💳", custom: false, category: "finance" },

    // Education & Learning
    { id: "coursera", name: "Coursera", url: "https://coursera.org", logo: "🎓", custom: false, category: "education" },
    { id: "udemy", name: "Udemy", url: "https://udemy.com", logo: "📚", custom: false, category: "education" },
    {
      id: "khan-academy",
      name: "Khan Academy",
      url: "https://khanacademy.org",
      logo: "🎓",
      custom: false,
      category: "education",
    },
    { id: "edx", name: "edX", url: "https://edx.org", logo: "🎓", custom: false, category: "education" },
    {
      id: "skillshare",
      name: "Skillshare",
      url: "https://skillshare.com",
      logo: "🎨",
      custom: false,
      category: "education",
    },
    { id: "duolingo", name: "Duolingo", url: "https://duolingo.com", logo: "🦉", custom: false, category: "education" },
    { id: "babbel", name: "Babbel", url: "https://babbel.com", logo: "🗣️", custom: false, category: "education" },
    {
      id: "rosetta-stone",
      name: "Rosetta Stone",
      url: "https://rosettastone.com",
      logo: "🗿",
      custom: false,
      category: "education",
    },
    {
      id: "masterclass",
      name: "MasterClass",
      url: "https://masterclass.com",
      logo: "🎭",
      custom: false,
      category: "education",
    },
    {
      id: "pluralsight",
      name: "Pluralsight",
      url: "https://pluralsight.com",
      logo: "📚",
      custom: false,
      category: "education",
    },
    {
      id: "lynda",
      name: "LinkedIn Learning",
      url: "https://linkedin.com/learning",
      logo: "📚",
      custom: false,
      category: "education",
    },

    // Development & Tech Tools
    { id: "github", name: "GitHub", url: "https://github.com", logo: "🐙", custom: false, category: "tools" },
    { id: "gitlab", name: "GitLab", url: "https://gitlab.com", logo: "🦊", custom: false, category: "tools" },
    {
      id: "stackoverflow",
      name: "Stack Overflow",
      url: "https://stackoverflow.com",
      logo: "📚",
      custom: false,
      category: "tools",
    },
    { id: "codepen", name: "CodePen", url: "https://codepen.io", logo: "✏️", custom: false, category: "tools" },
    { id: "replit", name: "Replit", url: "https://replit.com", logo: "💻", custom: false, category: "tools" },
    {
      id: "codesandbox",
      name: "CodeSandbox",
      url: "https://codesandbox.io",
      logo: "📦",
      custom: false,
      category: "tools",
    },
    { id: "jsfiddle", name: "JSFiddle", url: "https://jsfiddle.net", logo: "🎻", custom: false, category: "tools" },
    { id: "devto", name: "Dev.to", url: "https://dev.to", logo: "👨‍💻", custom: false, category: "tools" },
    { id: "hashnode", name: "Hashnode", url: "https://hashnode.com", logo: "📝", custom: false, category: "tools" },
    {
      id: "producthunt",
      name: "Product Hunt",
      url: "https://producthunt.com",
      logo: "🚀",
      custom: false,
      category: "tools",
    },

    // Design & Creative
    { id: "figma", name: "Figma", url: "https://figma.com", logo: "🎨", custom: false, category: "design" },
    { id: "adobe", name: "Adobe", url: "https://adobe.com", logo: "🎨", custom: false, category: "design" },
    { id: "canva", name: "Canva", url: "https://canva.com", logo: "🎨", custom: false, category: "design" },
    { id: "dribbble", name: "Dribbble", url: "https://dribbble.com", logo: "🏀", custom: false, category: "design" },
    { id: "behance", name: "Behance", url: "https://behance.net", logo: "🎨", custom: false, category: "design" },
    { id: "unsplash", name: "Unsplash", url: "https://unsplash.com", logo: "📷", custom: false, category: "design" },
    { id: "pexels", name: "Pexels", url: "https://pexels.com", logo: "📸", custom: false, category: "design" },
    {
      id: "shutterstock",
      name: "Shutterstock",
      url: "https://shutterstock.com",
      logo: "📷",
      custom: false,
      category: "design",
    },
    {
      id: "getty",
      name: "Getty Images",
      url: "https://gettyimages.com",
      logo: "📸",
      custom: false,
      category: "design",
    },
    { id: "freepik", name: "Freepik", url: "https://freepik.com", logo: "🎨", custom: false, category: "design" },

    // Productivity & Work
    { id: "notion", name: "Notion", url: "https://notion.so", logo: "📝", custom: false, category: "productivity" },
    { id: "slack", name: "Slack", url: "https://slack.com", logo: "💬", custom: false, category: "productivity" },
    { id: "trello", name: "Trello", url: "https://trello.com", logo: "📋", custom: false, category: "productivity" },
    { id: "asana", name: "Asana", url: "https://asana.com", logo: "✅", custom: false, category: "productivity" },
    {
      id: "monday",
      name: "Monday.com",
      url: "https://monday.com",
      logo: "📅",
      custom: false,
      category: "productivity",
    },
    {
      id: "airtable",
      name: "Airtable",
      url: "https://airtable.com",
      logo: "📊",
      custom: false,
      category: "productivity",
    },
    { id: "clickup", name: "ClickUp", url: "https://clickup.com", logo: "⚡", custom: false, category: "productivity" },
    {
      id: "jira",
      name: "Jira",
      url: "https://atlassian.com/software/jira",
      logo: "🎯",
      custom: false,
      category: "productivity",
    },
    {
      id: "confluence",
      name: "Confluence",
      url: "https://atlassian.com/software/confluence",
      logo: "📄",
      custom: false,
      category: "productivity",
    },
    { id: "miro", name: "Miro", url: "https://miro.com", logo: "🎨", custom: false, category: "productivity" },
    { id: "zoom", name: "Zoom", url: "https://zoom.us", logo: "📹", custom: false, category: "productivity" },
    {
      id: "teams",
      name: "Microsoft Teams",
      url: "https://teams.microsoft.com",
      logo: "👥",
      custom: false,
      category: "productivity",
    },
    {
      id: "meet",
      name: "Google Meet",
      url: "https://meet.google.com",
      logo: "📹",
      custom: false,
      category: "productivity",
    },

    // Cloud Storage
    {
      id: "googledrive",
      name: "Google Drive",
      url: "https://drive.google.com",
      logo: "💾",
      custom: false,
      category: "productivity",
    },
    { id: "dropbox", name: "Dropbox", url: "https://dropbox.com", logo: "📦", custom: false, category: "productivity" },
    {
      id: "onedrive",
      name: "OneDrive",
      url: "https://onedrive.com",
      logo: "☁️",
      custom: false,
      category: "productivity",
    },
    { id: "icloud", name: "iCloud", url: "https://icloud.com", logo: "☁️", custom: false, category: "productivity" },
    { id: "box", name: "Box", url: "https://box.com", logo: "📦", custom: false, category: "productivity" },

    // Music & Audio
    { id: "spotify", name: "Spotify", url: "https://spotify.com", logo: "🎵", custom: false, category: "music" },
    {
      id: "apple-music",
      name: "Apple Music",
      url: "https://music.apple.com",
      logo: "🎵",
      custom: false,
      category: "music",
    },
    {
      id: "youtube-music",
      name: "YouTube Music",
      url: "https://music.youtube.com",
      logo: "🎵",
      custom: false,
      category: "music",
    },
    {
      id: "soundcloud",
      name: "SoundCloud",
      url: "https://soundcloud.com",
      logo: "🎵",
      custom: false,
      category: "music",
    },
    { id: "pandora", name: "Pandora", url: "https://pandora.com", logo: "🎵", custom: false, category: "music" },
    { id: "tidal", name: "Tidal", url: "https://tidal.com", logo: "🎵", custom: false, category: "music" },
    { id: "deezer", name: "Deezer", url: "https://deezer.com", logo: "🎵", custom: false, category: "music" },
    { id: "lastfm", name: "Last.fm", url: "https://last.fm", logo: "🎵", custom: false, category: "music" },
    { id: "bandcamp", name: "Bandcamp", url: "https://bandcamp.com", logo: "🎵", custom: false, category: "music" },

    // Gaming
    {
      id: "steam",
      name: "Steam",
      url: "https://store.steampowered.com",
      logo: "🎮",
      custom: false,
      category: "gaming",
    },
    {
      id: "epic-games",
      name: "Epic Games",
      url: "https://epicgames.com",
      logo: "🎮",
      custom: false,
      category: "gaming",
    },
    { id: "origin", name: "Origin", url: "https://origin.com", logo: "🎮", custom: false, category: "gaming" },
    { id: "battle-net", name: "Battle.net", url: "https://battle.net", logo: "⚔️", custom: false, category: "gaming" },
    { id: "uplay", name: "Ubisoft Connect", url: "https://ubisoft.com", logo: "🎮", custom: false, category: "gaming" },
    { id: "gog", name: "GOG", url: "https://gog.com", logo: "🎮", custom: false, category: "gaming" },
    { id: "itch", name: "itch.io", url: "https://itch.io", logo: "🎮", custom: false, category: "gaming" },
    { id: "roblox", name: "Roblox", url: "https://roblox.com", logo: "🎮", custom: false, category: "gaming" },
    { id: "minecraft", name: "Minecraft", url: "https://minecraft.net", logo: "🧱", custom: false, category: "gaming" },

    // Travel & Transportation
    { id: "airbnb", name: "Airbnb", url: "https://airbnb.com", logo: "🏠", custom: false, category: "travel" },
    { id: "booking", name: "Booking.com", url: "https://booking.com", logo: "✈️", custom: false, category: "travel" },
    { id: "expedia", name: "Expedia", url: "https://expedia.com", logo: "✈️", custom: false, category: "travel" },
    { id: "kayak", name: "Kayak", url: "https://kayak.com", logo: "🛫", custom: false, category: "travel" },
    { id: "priceline", name: "Priceline", url: "https://priceline.com", logo: "✈️", custom: false, category: "travel" },
    {
      id: "tripadvisor",
      name: "TripAdvisor",
      url: "https://tripadvisor.com",
      logo: "🧳",
      custom: false,
      category: "travel",
    },
    { id: "uber", name: "Uber", url: "https://uber.com", logo: "🚗", custom: false, category: "travel" },
    { id: "lyft", name: "Lyft", url: "https://lyft.com", logo: "🚗", custom: false, category: "travel" },
    { id: "maps", name: "Google Maps", url: "https://maps.google.com", logo: "🗺️", custom: false, category: "travel" },
    { id: "waze", name: "Waze", url: "https://waze.com", logo: "🗺️", custom: false, category: "travel" },

    // Food & Delivery
    { id: "doordash", name: "DoorDash", url: "https://doordash.com", logo: "🚗", custom: false, category: "food" },
    { id: "ubereats", name: "Uber Eats", url: "https://ubereats.com", logo: "🍔", custom: false, category: "food" },
    { id: "grubhub", name: "Grubhub", url: "https://grubhub.com", logo: "🍕", custom: false, category: "food" },
    { id: "postmates", name: "Postmates", url: "https://postmates.com", logo: "📦", custom: false, category: "food" },
    { id: "seamless", name: "Seamless", url: "https://seamless.com", logo: "🍔", custom: false, category: "food" },
    { id: "zomato", name: "Zomato", url: "https://zomato.com", logo: "🍽️", custom: false, category: "food" },
    { id: "yelp", name: "Yelp", url: "https://yelp.com", logo: "⭐", custom: false, category: "food" },
    { id: "opentable", name: "OpenTable", url: "https://opentable.com", logo: "🍽️", custom: false, category: "food" },

    // Health & Fitness
    {
      id: "myfitnesspal",
      name: "MyFitnessPal",
      url: "https://myfitnesspal.com",
      logo: "💪",
      custom: false,
      category: "health",
    },
    { id: "strava", name: "Strava", url: "https://strava.com", logo: "🏃", custom: false, category: "health" },
    { id: "fitbit", name: "Fitbit", url: "https://fitbit.com", logo: "⌚", custom: false, category: "health" },
    {
      id: "nike-run",
      name: "Nike Run Club",
      url: "https://nike.com/nrc-app",
      logo: "👟",
      custom: false,
      category: "health",
    },
    { id: "peloton", name: "Peloton", url: "https://onepeloton.com", logo: "🚴", custom: false, category: "health" },
    { id: "headspace", name: "Headspace", url: "https://headspace.com", logo: "🧘", custom: false, category: "health" },
    { id: "calm", name: "Calm", url: "https://calm.com", logo: "🧘", custom: false, category: "health" },

    // Tech Companies & Platforms
    { id: "apple", name: "Apple", url: "https://apple.com", logo: "🍎", custom: false, category: "tools" },
    { id: "microsoft", name: "Microsoft", url: "https://microsoft.com", logo: "🪟", custom: false, category: "tools" },
    { id: "google-main", name: "Google", url: "https://google.com", logo: "🔍", custom: false, category: "tools" },
    { id: "meta", name: "Meta", url: "https://meta.com", logo: "👥", custom: false, category: "tools" },
    { id: "tesla", name: "Tesla", url: "https://tesla.com", logo: "🚗", custom: false, category: "tools" },
    { id: "spacex", name: "SpaceX", url: "https://spacex.com", logo: "🚀", custom: false, category: "tools" },
    { id: "openai", name: "OpenAI", url: "https://openai.com", logo: "🤖", custom: false, category: "tools" },
    { id: "anthropic", name: "Anthropic", url: "https://anthropic.com", logo: "🧠", custom: false, category: "tools" },

    // International Sites
    { id: "vk", name: "VKontakte", url: "https://vk.com", logo: "👥", custom: false, category: "social" },
    { id: "weibo", name: "Weibo", url: "https://weibo.com", logo: "🐦", custom: false, category: "social" },
    { id: "qq", name: "QQ", url: "https://qq.com", logo: "🐧", custom: false, category: "social" },
    { id: "naver", name: "Naver", url: "https://naver.com", logo: "🔍", custom: false, category: "tools" },
    { id: "kakao", name: "KakaoTalk", url: "https://kakaocorp.com", logo: "💬", custom: false, category: "social" },
    { id: "ok-ru", name: "Odnoklassniki", url: "https://ok.ru", logo: "👥", custom: false, category: "social" },

    // Miscellaneous Popular Sites
    {
      id: "wikipedia",
      name: "Wikipedia",
      url: "https://wikipedia.org",
      logo: "📖",
      custom: false,
      category: "education",
    },
    { id: "imdb", name: "IMDb", url: "https://imdb.com", logo: "🎬", custom: false, category: "video" },
    { id: "weather", name: "Weather.com", url: "https://weather.com", logo: "🌤️", custom: false, category: "tools" },
    {
      id: "craigslist",
      name: "Craigslist",
      url: "https://craigslist.org",
      logo: "📋",
      custom: false,
      category: "shopping",
    },
    {
      id: "archive",
      name: "Internet Archive",
      url: "https://archive.org",
      logo: "📚",
      custom: false,
      category: "tools",
    },
    {
      id: "translate",
      name: "Google Translate",
      url: "https://translate.google.com",
      logo: "🌐",
      custom: false,
      category: "tools",
    },
  ]

  // Filter sites based on search and category
  const filteredSites = useMemo(() => {
    let filtered = sites.filter((site) => !site.featured)

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (site) =>
          site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategory === "favorites") {
      filtered = filtered.filter((site) => favorites.includes(site.id))
    } else if (selectedCategory === "custom") {
      filtered = filtered.filter((site) => site.custom === true)
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter((site) => site.category === selectedCategory)
    }

    return filtered
  }, [sites, searchQuery, selectedCategory, favorites])

  const handleGuestTimeExpired = () => {
    setIsGuestTimeExpired(true)
    showToast("Time's up! Sign up to continue using drag & drop.", "info")
  }

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true)
  }

  const handleAuth = (provider) => {
    // Migrate guest data to authenticated user data
    const guestSites = localStorage.getItem("webhub-sites")
    const guestFavorites = localStorage.getItem("webhub-favorites")
    
    // Clear guest timer
    localStorage.removeItem("guest-start-time")
    setIsGuestTimeExpired(false)

    // Simulate authentication
    const newUser = {
      type: "authenticated",
      name: provider === "wechat" ? "张三" : "John Doe",
      email: provider === "wechat" ? "zhangsan@wechat.com" : "john@example.com",
      customCount: 3,
      pro: provider === "pro" || provider === "google" || provider === "wechat",
    }
    
    setUser(newUser)
    setShowUpgradeModal(false)
    
    // Migrate data if user had guest data
    if (guestSites || guestFavorites) {
      if (guestSites) {
        const userKey = `webhub-sites-${newUser.email}`
        localStorage.setItem(userKey, guestSites)
      }
      if (guestFavorites) {
        const userKey = `webhub-favorites-${newUser.email}`
        localStorage.setItem(userKey, guestFavorites)
      }
      showToast(`Welcome! Your data has been saved permanently! 🎉`)
    } else {
      showToast(`Welcome! You now have unlimited access! 🎉`)
    }
  }

  const shuffleSites = () => {
    if (user.type === "guest" && isGuestTimeExpired) {
      setShowUpgradeModal(true)
      return
    }

    const featuredSites = sites.filter((site) => site.featured)
    const regularSites = sites.filter((site) => !site.featured)

    // Fisher-Yates shuffle for regular sites
    const shuffled = [...regularSites]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const newSites = [...featuredSites, ...shuffled]
    setSites(newSites)
    setIsShuffled(!isShuffled)

    localStorage.setItem("webhub-sites", JSON.stringify(newSites))
    localStorage.setItem("webhub-shuffle", JSON.stringify(!isShuffled))

    showToast("Sites shuffled! ✨")
  }

  const handleReorder = (newSites) => {
    if (user.type === "guest" && isGuestTimeExpired) {
      setShowUpgradeModal(true)
      return
    }

    const featuredSites = sites.filter((site) => site.featured)
    const reorderedSites = [...featuredSites, ...newSites]
    setSites(reorderedSites)
    localStorage.setItem("webhub-sites", JSON.stringify(reorderedSites))
    showToast("Sites reordered! 📝")
  }

  const addCustomSite = (newSite) => {
    if (!user.pro && user.customCount >= 10) {
      showToast("Free limit reached! Upgrade to Pro for unlimited sites.", "error")
      return
    }

    const siteWithId = {
      ...newSite,
      id: `custom-${Date.now()}`,
      custom: true,
      category: "tools",
    }

    const updatedSites = [...sites, siteWithId]
    setSites(updatedSites)
    setUser((prev) => ({ ...prev, customCount: prev.customCount + 1 }))

    // Automatically add the new site to favorites
    const updatedFavorites = [...favorites, siteWithId.id]
    setFavorites(updatedFavorites)

    saveUserData("webhub-sites", updatedSites)
    saveUserData("webhub-favorites", updatedFavorites)
    
    if (user.type === "guest") {
      showToast(`${newSite.name} added! ⭐ Sign up to keep your data forever!`)
    } else {
      showToast(`${newSite.name} added to favorites! ⭐`)
    }
  }

  const toggleFavorite = (siteId) => {
    const newFavorites = favorites.includes(siteId)
      ? favorites.filter((id) => id !== siteId)
      : [...favorites, siteId]
    
    setFavorites(newFavorites)
    saveUserData("webhub-favorites", newFavorites)
    
    const site = sites.find((s) => s.id === siteId)
    const isFavorited = newFavorites.includes(siteId)
    
    if (user.type === "guest" && isFavorited) {
      showToast(`${site?.name} favorited! ⭐ Sign up to keep it forever!`)
    } else {
      showToast(`${site?.name} ${isFavorited ? "added to" : "removed from"} favorites`)
    }
  }

  const removeSite = (siteId) => {
    const updatedSites = sites.filter((site) => site.id !== siteId)
    setSites(updatedSites)

    const removedSite = sites.find((site) => site.id === siteId)
    if (removedSite?.custom) {
      setUser((prev) => ({ ...prev, customCount: prev.customCount - 1 }))
    }

    // Also remove from favorites if it was favorited
    if (favorites.includes(siteId)) {
      const newFavorites = favorites.filter((id) => id !== siteId)
      setFavorites(newFavorites)
      saveUserData("webhub-favorites", newFavorites)
    }

    saveUserData("webhub-sites", updatedSites)
    showToast("Site removed")
  }

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const isDragDisabled = user.type === "guest" && isGuestTimeExpired

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Header
        user={user}
        setUser={setUser}
        onGuestTimeExpired={handleGuestTimeExpired}
        onUpgradeClick={handleUpgradeClick}
      />

      <main className="container mx-auto px-4 py-2">
        {/* Data Loss Warning for Guest Users */}
        {user.type === "guest" && (favorites.length > 0 || sites.some(site => site.custom)) && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-300">Guest Session - Data Will Be Lost!</h3>
                  <p className="text-sm text-red-200">
                    You have {favorites.length} favorites and {sites.filter(s => s.custom).length} custom sites. 
                    Sign up to keep them forever!
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Save My Data
              </Button>
            </div>
          </div>
        )}

        <FeaturedProducts sites={sites.filter((site) => site.featured)} />

        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredCount={filteredSites.length}
        />

        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">300+ Sites • One Page View</h2>
            <p className="text-xs text-white/60">
              {selectedCategory === "custom" 
                ? `${filteredSites.length} custom sites`
                : selectedCategory === "favorites"
                ? `${filteredSites.length} favorite sites`
                : `${filteredSites.length} of ${sites.filter((site) => !site.featured).length} websites`
              } • Ultra-compact single page
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Site
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shuffleSites}
              disabled={isDragDisabled}
              className={`text-xs ${
                isDragDisabled
                  ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                  : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
              }`}
            >
              <Shuffle className="w-3 h-3 mr-1" />
              Shuffle
            </Button>
          </div>
        </div>

        <UltraCompactSiteGrid
          sites={filteredSites}
          onRemove={removeSite}
          onReorder={handleReorder}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
          isDragDisabled={isDragDisabled}
        />
      </main>



      <AddSiteModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addCustomSite} user={user} />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onAuth={handleAuth}
        isTimeExpired={isGuestTimeExpired}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
