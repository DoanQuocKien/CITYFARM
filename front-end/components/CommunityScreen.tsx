import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Share2, Plus, Search, MapPin, ShoppingBag, Leaf, BadgeCheck, X, Image as ImageIcon, HelpCircle, Camera, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import type { Screen, CommunityPost, Plant, FeedPost } from '../App';

interface CommunityScreenProps {
  onNavigate: (screen: Screen) => void;
  onViewSharedPlant?: (plant: Plant & { journal?: Array<{ photo: string; date: string }> }) => void;
}

// --- MOCK DATA ---

const INITIAL_FEED_POSTS: any[] = [
  {
    id: '1',
    type: 'showcase',
    user: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    location: "Dĩ An, Vietnam",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80",
    caption: "My cherry tomatoes are finally turning red! 🍅 Used the CityFarm AI schedule.",
    likes: 24,
    comments: 5,
    time: "2h ago",
    tags: ["#TomatoSeason", "#UrbanHarvest"],
    isLiked: false
  },
  {
    id: '2',
    type: 'question',
    user: "Mike Ross",
    avatar: "https://i.pravatar.cc/150?u=mike",
    location: "District 1",
    image: "https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=800&q=80",
    caption: "My Mint leaves are turning yellow at the tips. Is this too much sun or not enough water? 🌿",
    likes: 12,
    comments: 8,
    time: "4h ago",
    tags: ["#HelpNeeded", "#Mint", "#Diagnosis"],
    isLiked: true
  },
  {
    id: '3',
    type: 'showcase',
    user: "Lisa Pham",
    avatar: "https://i.pravatar.cc/150?u=lisa",
    location: "District 5",
    image: "https://images.unsplash.com/photo-1464226184485-280280af0fb2?auto=format&fit=crop&w=800&q=80",
    caption: "Basil is thriving this season! Perfect for my pho recipes 🌱",
    likes: 32,
    comments: 6,
    time: "5h ago",
    tags: ["#BasilSeason", "#HomeGarden"],
    isLiked: false
  },
  {
    id: '4',
    type: 'question',
    user: "John Park",
    avatar: "https://i.pravatar.cc/150?u=john",
    location: "Thao Dien",
    image: "https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=800&q=80",
    caption: "How often should I water my lettuce in this heat? Getting brown spots 😟",
    likes: 8,
    comments: 12,
    time: "6h ago",
    tags: ["#LettuceHelp", "#Watering"],
    isLiked: false
  },
  {
    id: '5',
    type: 'showcase',
    user: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?u=emma",
    location: "Binh Thanh",
    image: "https://images.unsplash.com/photo-1615485276934-a65bde780c0d?auto=format&fit=crop&w=800&q=80",
    caption: "First harvest! 🎉 Can't believe I grew this from a tiny seed",
    likes: 45,
    comments: 15,
    time: "8h ago",
    tags: ["#FirstHarvest", "#GardenLife"],
    isLiked: false
  },
  {
    id: '6',
    type: 'plant-share',
    user: "David Nguyen",
    avatar: "https://i.pravatar.cc/150?u=david",
    location: "District 3",
    caption: "Check out my Green Lettuce - 43% grown and looking great! 🥬",
    likes: 18,
    comments: 4,
    time: "1h ago",
    tags: ["#PlantSharing", "#LettuceGrowing"],
    isLiked: false,
    sharedPlant: {
      id: '2',
      name: 'Green Lettuce',
      type: 'Vegetable',
      code: 'CITYFARM-LETTUCE-02',
      plantedDate: '2025-12-28',
      daysGrowing: 15,
      harvestDays: 35,
      health: 'healthy' as const,
      imageUrl: 'https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=1000&q=80',
      nextWatering: 'Tomorrow, 8:00 AM',
      nextFertilizing: 'In 5 days',
      progress: 43,
    }
  },
  {
    id: '7',
    type: 'showcase',
    user: "Anh Tran",
    avatar: "https://i.pravatar.cc/150?u=anh",
    location: "Hoan Kiem",
    image: "https://images.unsplash.com/photo-1599599810694-a5f897e89b1c?auto=format&fit=crop&w=800&q=80",
    caption: "Just installed my new CityFarm kit! Super excited to start growing 🌿✨",
    likes: 28,
    comments: 9,
    time: "9h ago",
    tags: ["#NewBeginner", "#GardenSetup"],
    isLiked: false
  },
  {
    id: '8',
    type: 'question',
    user: "Huy Hoang",
    avatar: "https://i.pravatar.cc/150?u=huy",
    location: "District 4",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    caption: "Anyone else dealing with spider mites? My spinach is getting infested 😤",
    likes: 15,
    comments: 10,
    time: "10h ago",
    tags: ["#Pest", "#SpinachCare", "#Help"],
    isLiked: false
  },
  {
    id: '9',
    type: 'showcase',
    user: "Ngan Le",
    avatar: "https://i.pravatar.cc/150?u=ngan",
    location: "District 2",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    caption: "My indoor herb garden is the best decision I made this year! 🌻",
    likes: 56,
    comments: 18,
    time: "12h ago",
    tags: ["#IndoorGarden", "#Herbs", "#Success"],
    isLiked: false
  },
  {
    id: '10',
    type: 'plant-share',
    user: "Duc Pham",
    avatar: "https://i.pravatar.cc/150?u=duc",
    location: "District 7",
    caption: "My tomatoes are 18% through the growth journey! Cannot wait for harvest! 🍅",
    likes: 22,
    comments: 7,
    time: "3h ago",
    tags: ["#TomatoJourney", "#PlantSharing"],
    isLiked: false,
    sharedPlant: {
      id: '1',
      name: 'Cherry Tomato',
      type: 'Vegetable',
      code: 'CITYFARM-TOMATO-01',
      plantedDate: '2026-01-01',
      daysGrowing: 11,
      harvestDays: 60,
      health: 'healthy' as const,
      imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80',
      nextWatering: 'Today, 5:00 PM',
      nextFertilizing: 'In 3 days',
      progress: 18,
    }
  }
];

const INITIAL_MARKET_LISTINGS: any[] = [
  {
    id: '101',
    seller: {
      name: "Grandma Mai",
      avatar: "https://i.pravatar.cc/150?u=mai",
      district: "District 3",
      verifiedGrower: true
    },
    plant: "Organic Bok Choy",
    quantity: "500g",
    price: "30,000₫",
    imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80",
    description: "Harvested this morning. No pesticides, grown in hydroponic tower.",
    postedTime: "1h ago",
    plantingLogs: 45
  },
  {
    id: '102',
    seller: {
      name: "Tom's Balcony",
      avatar: "https://i.pravatar.cc/150?u=tom",
      district: "Thao Dien",
      verifiedGrower: false
    },
    plant: "Thai Basil Bundle",
    quantity: "100g",
    price: "15,000₫",
    imageUrl: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=800&q=80",
    description: "Extra spicy aroma. Perfect for Pho!",
    postedTime: "3h ago",
    plantingLogs: 20
  },
  {
    id: '103',
    seller: {
      name: "Green Thumbs Co",
      avatar: "https://i.pravatar.cc/150?u=green",
      district: "District 1",
      verifiedGrower: true
    },
    plant: "Fresh Cherry Tomatoes",
    quantity: "300g",
    price: "25,000₫",
    imageUrl: "https://images.unsplash.com/photo-1582284905089-52a04d9a7353?auto=format&fit=crop&w=800&q=80",
    description: "Sweet and juicy. Organically grown from seed.",
    postedTime: "2h ago",
    plantingLogs: 60
  },
  {
    id: '104',
    seller: {
      name: "Urban Farmer",
      avatar: "https://i.pravatar.cc/150?u=farmer",
      district: "Binh Thanh",
      verifiedGrower: true
    },
    plant: "Peppermint Bunch",
    quantity: "150g",
    price: "18,000₫",
    imageUrl: "https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=800&q=80",
    description: "Perfect for tea. Pesticide-free!",
    postedTime: "4h ago",
    plantingLogs: 35
  },
  {
    id: '105',
    seller: {
      name: "Quynh's Garden",
      avatar: "https://i.pravatar.cc/150?u=quynh",
      district: "District 5",
      verifiedGrower: true
    },
    plant: "Organic Spinach",
    quantity: "400g",
    price: "28,000₫",
    imageUrl: "https://images.unsplash.com/photo-1599599810694-a5f897e89b1c?auto=format&fit=crop&w=800&q=80",
    description: "Fresh, tender leaves. Great for smoothies and salads!",
    postedTime: "5h ago",
    plantingLogs: 42
  },
  {
    id: '106',
    seller: {
      name: "Hanoi Herbs",
      avatar: "https://i.pravatar.cc/150?u=hanoi",
      district: "Hoan Kiem",
      verifiedGrower: true
    },
    plant: "Cilantro Bundle",
    quantity: "200g",
    price: "20,000₫",
    imageUrl: "https://images.unsplash.com/photo-1599599810694-a5f897e89b1c?auto=format&fit=crop&w=800&q=80",
    description: "Aromatic and fresh. Perfect for Asian dishes.",
    postedTime: "6h ago",
    plantingLogs: 30
  },
  {
    id: '107',
    seller: {
      name: "Saigon Greens",
      avatar: "https://i.pravatar.cc/150?u=saigon",
      district: "District 2",
      verifiedGrower: true
    },
    plant: "Mixed Greens",
    quantity: "600g",
    price: "32,000₫",
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    description: "Variety of fresh salad greens. Harvested daily.",
    postedTime: "1h ago",
    plantingLogs: 38
  },
  {
    id: '108',
    seller: {
      name: "Local Herbs",
      avatar: "https://i.pravatar.cc/150?u=herbs",
      district: "District 7",
      verifiedGrower: false
    },
    plant: "Green Onion Bundle",
    quantity: "250g",
    price: "12,000₫",
    imageUrl: "https://images.unsplash.com/photo-1599599810694-a5f897e89b1c?auto=format&fit=crop&w=800&q=80",
    description: "Fresh and crispy. Great for cooking!",
    postedTime: "7h ago",
    plantingLogs: 25
  }
];

export function CommunityScreen({ onNavigate, onViewSharedPlant }: CommunityScreenProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'market'>('feed');
  const [feedFilter, setFeedFilter] = useState<'all' | 'showcase' | 'question'>('all');
  
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('feed_posts');
    return saved ? JSON.parse(saved) : INITIAL_FEED_POSTS;
  });

  const [marketListings, setMarketListings] = useState(() => {
    const saved = localStorage.getItem('market_listings');
    if (!saved) return INITIAL_MARKET_LISTINGS;

    const parsed = JSON.parse(saved);
    const existingIds = new Set(INITIAL_MARKET_LISTINGS.map((m: any) => m.id));
    const combined = [
      ...INITIAL_MARKET_LISTINGS,
      ...parsed.filter((m: any) => !existingIds.has(m.id)),
    ];
    return combined;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [postType, setPostType] = useState<'caption' | 'image' | 'plant'>('caption');
  const [selectedPlantForShare, setSelectedPlantForShare] = useState<any>(null);
  const [showPlantSelector, setShowPlantSelector] = useState(false);
  const [plantCarouselIndex, setPlantCarouselIndex] = useState(0);

  const handleLike = (id: string) => {
    setPosts(posts.map((post: any) => 
      post.id === id ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked } : post
    ));
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm("Delete this post?")) {
      const newPosts = posts.filter((p: any) => p.id !== id);
      setPosts(newPosts);
      localStorage.setItem('feed_posts', JSON.stringify(newPosts));
    }
  };

  const handleDeleteMarketListing = (id: string) => {
    if (window.confirm("Remove this listing?")) {
      const newListings = marketListings.filter((m: any) => m.id !== id);
      setMarketListings(newListings);
      localStorage.setItem('market_listings', JSON.stringify(newListings));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setNewImage(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = () => {
    if (!newCaption) {
      alert("Please add a caption");
      return;
    }

    const newPost: any = {
      id: Date.now().toString(),
      type: postType === 'plant' ? 'plant-share' : 'showcase',
      user: 'You',
      avatar: 'https://i.pravatar.cc/150?u=you',
      location: 'Dĩ An',
      caption: newCaption,
      likes: 0,
      comments: 0,
      time: 'Just now',
      tags: [],
      isLiked: false
    };

    if (postType === 'image' && newImage) {
      newPost.image = newImage;
    } else if (postType === 'plant' && selectedPlantForShare) {
      newPost.sharedPlant = selectedPlantForShare;
    }
    // Caption posts have no image

    const newPosts = [newPost, ...posts];
    setPosts(newPosts);
    localStorage.setItem('feed_posts', JSON.stringify(newPosts));
    setIsCreating(false);
    setNewCaption("");
    setNewImage(null);
    setSelectedPlantForShare(null);
    setShowPlantSelector(false);
  };

  // Filter logic
  const filteredPosts = feedFilter === 'all' 
    ? posts 
    : posts.filter((p: any) => p.type === feedFilter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-10 border-b shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Community</h2>
          <div className="flex gap-2">
            {activeTab === 'feed' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
        
        {/* MAIN TABS (Feed vs Market) */}
        <div className="flex px-4 pb-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'feed' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            Social Feed
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'market' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            Fresh Market
          </button>
        </div>
      </header>

      {/* --- TAB 1: SOCIAL FEED --- */}
      {activeTab === 'feed' && (
        <div className="p-4 space-y-5 animate-in slide-in-from-left-4 duration-300">
           
           {/* SUB-FILTERS (Showcase vs Questions) */}
           <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Badge 
                variant={feedFilter === 'all' ? "default" : "outline"}
                className={`cursor-pointer px-4 py-1.5 rounded-full ${feedFilter === 'all' ? 'bg-gray-800' : 'bg-white'}`}
                onClick={() => setFeedFilter('all')}
              >
                All Posts
              </Badge>
              <Badge 
                variant={feedFilter === 'showcase' ? "default" : "outline"}
                className={`cursor-pointer px-4 py-1.5 rounded-full flex items-center gap-1 ${feedFilter === 'showcase' ? 'bg-green-600' : 'bg-white'}`}
                onClick={() => setFeedFilter('showcase')}
              >
                <Camera className="w-3 h-3" /> Showcase
              </Badge>
              <Badge 
                variant={feedFilter === 'question' ? "default" : "outline"}
                className={`cursor-pointer px-4 py-1.5 rounded-full flex items-center gap-1 ${feedFilter === 'question' ? 'bg-orange-500 border-orange-500 hover:bg-orange-600' : 'bg-white text-orange-600 border-orange-200'}`}
                onClick={() => setFeedFilter('question')}
              >
                <HelpCircle className="w-3 h-3" /> Q&A
              </Badge>
           </div>

           {filteredPosts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
              {/* Post Header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={post.avatar} 
                    className="w-8 h-8 rounded-full bg-gray-200" 
                    onError={(e) => { e.currentTarget.src = 'https://gachwala.in/wp-content/uploads/2022/06/IMAGE-1-13.webp'; }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                       <p className="text-sm font-semibold">{post.user}</p>
                       {/* Question Badge */}
                       {post.type === 'question' && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                             <HelpCircle className="w-3 h-3" /> Question
                          </span>
                       )}
                       {/* Plant Share Badge */}
                       {post.type === 'plant-share' && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                             <Leaf className="w-3 h-3" /> Plant Share
                          </span>
                       )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {post.location}</p>
                  </div>
                </div>
                {post.user === 'You' && (
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Image (Regular posts) */}
              {post.type !== 'plant-share' && post.image && (
                <div className="aspect-square bg-gray-100 relative">
                  <img 
                    src={post.image} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = 'https://gachwala.in/wp-content/uploads/2022/06/IMAGE-1-13.webp'; }}
                  />
                </div>
              )}

              {/* Plant Share Card */}
              {post.type === 'plant-share' && post.sharedPlant && (
                <button
                  onClick={() => onViewSharedPlant?.(post.sharedPlant)}
                  className="w-full text-left hover:opacity-90 transition-opacity"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img 
                      src={post.sharedPlant.imageUrl} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.src = 'https://gachwala.in/wp-content/uploads/2022/06/IMAGE-1-13.webp'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h4 className="font-bold text-lg">{post.sharedPlant.name}</h4>
                      <p className="text-xs text-green-100">{post.sharedPlant.type} • Day {post.sharedPlant.daysGrowing}</p>
                      <div className="mt-2 bg-white/20 rounded-full h-1.5">
                        <div 
                          className="bg-green-400 h-full rounded-full" 
                          style={{width: `${(post.sharedPlant.daysGrowing / post.sharedPlant.harvestDays) * 100}%`}}
                        />
                      </div>
                      <p className="text-xs mt-1 text-green-100">{post.sharedPlant.progress}% complete</p>
                    </div>
                  </div>
                </button>
              )}

              {/* Action Bar */}
              <div className="p-3">
                <div className="flex gap-4 mb-3">
                  <button onClick={() => handleLike(post.id)}>
                    <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                  <MessageCircle className="w-6 h-6 text-gray-600" />
                  <Share2 className="w-6 h-6 text-gray-600" />
                </div>
                
                {/* Caption */}
                <p className="text-sm">
                   <span className="font-semibold">{post.user}</span> {post.caption}
                </p>
                
                {/* Tags */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {post.tags && post.tags.map((tag: string) => (
                     <span key={tag} className="text-xs text-blue-600 font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* --- TAB 2: MARKETPLACE --- */}
      {activeTab === 'market' && (
        <div className="p-4 space-y-4 animate-in slide-in-from-right-4 duration-300">
          {/* Market Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 mb-2">
             <h3 className="font-bold text-green-800 mb-1 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Fresh Market
             </h3>
             <p className="text-sm text-green-700">Buy & sell verified home-grown produce.</p>
          </div>

          {marketListings.map((item: any) => (
            <Card key={item.id} className="flex overflow-hidden shadow-sm border border-gray-100 hover:border-green-300 transition-colors group relative">
               {/* Left: Image */}
               <div className="w-1/3 relative">
                 <img 
                   src={item.imageUrl} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                   onError={(e) => { e.currentTarget.src = 'https://gachwala.in/wp-content/uploads/2022/06/IMAGE-1-13.webp'; }}
                 />
                 <Badge className="absolute top-2 left-2 bg-white/95 text-black text-[10px] shadow-sm hover:bg-white">
                    {item.quantity}
                 </Badge>
               </div>

               {/* Right: Info */}
               <div className="flex-1 p-3 flex flex-col justify-between bg-white">
                 <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 leading-tight">{item.plant}</h3>
                      <span className="font-bold text-green-600 whitespace-nowrap ml-2">{item.price}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mb-2">
                       <img 
                         src={item.seller.avatar} 
                         className="w-4 h-4 rounded-full" 
                         onError={(e) => { e.currentTarget.src = 'https://gachwala.in/wp-content/uploads/2022/06/IMAGE-1-13.webp'; }}
                       />
                       <span className="text-xs text-gray-500 truncate">{item.seller.name}</span>
                       {item.seller.verifiedGrower && <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 w-fit px-2 py-1 rounded-md mb-2">
                       <Leaf className="w-3 h-3" />
                       Verified Log: {item.plantingLogs} days
                    </div>
                 </div>

                 <div className="flex justify-between gap-2">
                    <Button size="sm" className="bg-gray-900 text-white h-8 text-xs hover:bg-green-600 transition-colors flex-1">
                       Buy Now
                    </Button>
                    {item.seller.name === 'You' && (
                      <button 
                        onClick={() => handleDeleteMarketListing(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                 </div>
               </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE POST MODAL (Portal) */}
      {isCreating && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <Card className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0">
                 <h3 className="font-bold">Create Post</h3>
                 <button onClick={() => {setIsCreating(false); setNewCaption(""); setNewImage(null); setSelectedPlantForShare(null); setShowPlantSelector(false); setPlantCarouselIndex(0);}} className="p-1 hover:bg-gray-200 rounded-full">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-4 space-y-4">
                 {/* Post Type Selector in Modal */}
                 <div className="flex gap-2">
                    <Button 
                      variant={postType === 'caption' ? 'default' : 'outline'} 
                      size="sm" 
                      className={`flex-1 ${postType === 'caption' ? 'bg-green-600' : 'border-green-200'}`}
                      onClick={() => {setPostType('caption'); setShowPlantSelector(false);}}
                    >
                        Caption
                    </Button>
                    <Button 
                      variant={postType === 'image' ? 'default' : 'outline'}
                      size="sm" 
                      className={`flex-1 ${postType === 'image' ? 'bg-green-600' : 'border-green-200'}`}
                      onClick={() => {setPostType('image'); setShowPlantSelector(false);}}
                    >
                        <ImageIcon className="w-4 h-4 mr-2" /> Photo
                    </Button>
                    <Button 
                      variant={postType === 'plant' ? 'default' : 'outline'}
                      size="sm" 
                      className={`flex-1 ${postType === 'plant' ? 'bg-green-600' : 'border-green-200'}`}
                      onClick={() => {setPostType('plant'); setShowPlantSelector(true);}}
                    >
                        <Leaf className="w-4 h-4 mr-2" /> Plant
                    </Button>
                 </div>

                 <textarea 
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Share your gardening journey..."
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24"
                 />
                 
                 {postType === 'image' && (
                   <div>
                     {newImage ? (
                       <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                         <img src={newImage} className="w-full h-full object-cover" />
                         <button
                           onClick={() => setNewImage(null)}
                           className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-600"
                         >
                           <X className="w-4 h-4 text-white" />
                         </button>
                       </div>
                     ) : (
                       <label className="aspect-video bg-gray-50 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-sm">Click to Upload Photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                       </label>
                     )}
                   </div>
                 )}

                 {postType === 'plant' && showPlantSelector && (() => {
                   const myPlants = JSON.parse(localStorage.getItem('my_garden_plants') || '[]');
                   if (myPlants.length === 0) {
                     return (
                       <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                         <p>No plants in your garden yet!</p>
                       </div>
                     );
                   }
                   const currentPlant = myPlants[plantCarouselIndex];
                   if (!selectedPlantForShare && currentPlant) {
                     setSelectedPlantForShare(currentPlant);
                   }
                   return (
                     <div className="space-y-2">
                       <p className="text-sm font-semibold text-gray-700">Select a plant to share:</p>
                       <div className="relative border border-gray-200 rounded-lg p-4 bg-white">
                         {/* Plant Card */}
                         <div className="flex items-center gap-3 mb-3">
                           <img 
                             src={currentPlant.imageUrl} 
                             className="w-20 h-20 rounded-lg object-cover flex-shrink-0" 
                             onError={(e) => { e.currentTarget.src = 'https://gachwala.in/wp-content/uploads/2022/06/IMAGE-1-13.webp'; }}
                           />
                           <div className="flex-1">
                             <p className="font-bold text-gray-900">{currentPlant.name}</p>
                             <p className="text-sm text-gray-500">{currentPlant.type} • Day {currentPlant.daysGrowing}</p>
                             <div className="flex items-center gap-2 mt-2">
                               <div className="flex-1 bg-gray-200 rounded-full h-2">
                                 <div 
                                   className="bg-green-500 h-full rounded-full" 
                                   style={{width: `${currentPlant.progress}%`}}
                                 />
                               </div>
                               <span className="text-xs font-semibold text-gray-600">{currentPlant.progress}%</span>
                             </div>
                           </div>
                         </div>
                         
                         {/* Navigation Arrows */}
                         <div className="flex justify-between items-center">
                           <button
                             onClick={() => {
                               const newIndex = (plantCarouselIndex - 1 + myPlants.length) % myPlants.length;
                               setPlantCarouselIndex(newIndex);
                               setSelectedPlantForShare(myPlants[newIndex]);
                             }}
                             className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                             disabled={myPlants.length <= 1}
                           >
                             <svg className="w-5 h-5 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                               <path d="M15 19l-7-7 7-7"></path>
                             </svg>
                           </button>
                           
                           <div className="text-xs text-gray-500 font-medium">
                             {plantCarouselIndex + 1} / {myPlants.length}
                           </div>
                           
                           <button
                             onClick={() => {
                               const newIndex = (plantCarouselIndex + 1) % myPlants.length;
                               setPlantCarouselIndex(newIndex);
                               setSelectedPlantForShare(myPlants[newIndex]);
                             }}
                             className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                             disabled={myPlants.length <= 1}
                           >
                             <svg className="w-5 h-5 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                               <path d="M9 5l7 7-7 7"></path>
                             </svg>
                           </button>
                         </div>
                       </div>
                     </div>
                   );
                 })()}
                 
                 <Button 
                   className="w-full bg-green-600 hover:bg-green-700 h-12" 
                   onClick={handleCreatePost}
                 >
                    Post to Community
                 </Button>
              </div>
           </Card>
        </div>,
        document.body
      )}
    <div className="h-24"/>
    </div>
  );
}