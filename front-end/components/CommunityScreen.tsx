import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Share2, Plus, Search, MapPin, ShoppingBag, Leaf, BadgeCheck, X, Image as ImageIcon, HelpCircle, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import type { Screen, CommunityPost } from '../App';

interface CommunityScreenProps {
  onNavigate: (screen: Screen) => void;
}

// --- MOCK DATA ---

const FEED_POSTS = [
  {
    id: 1,
    type: 'showcase', // 'showcase' or 'question'
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
    id: 2,
    type: 'question', // This is a Question Post
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
  }
];

const MARKET_LISTINGS: CommunityPost[] = [
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
  }
];

export function CommunityScreen({ onNavigate }: CommunityScreenProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'market'>('feed');
  const [feedFilter, setFeedFilter] = useState<'all' | 'showcase' | 'question'>('all'); // Sub-filter
  
  const [posts, setPosts] = useState(FEED_POSTS);
  const [isCreating, setIsCreating] = useState(false);
  const [newCaption, setNewCaption] = useState("");

  const handleLike = (id: number) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked } : post
    ));
  };

  // Filter logic
  const filteredPosts = feedFilter === 'all' 
    ? posts 
    : posts.filter(p => p.type === feedFilter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-10 border-b shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Community</h2>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="w-5 h-5 text-gray-600" />
          </Button>
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

           {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
              {/* Post Header */}
              <div className="p-3 flex items-center gap-3">
                <img src={post.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-semibold">{post.user}</p>
                     {/* Question Badge */}
                     {post.type === 'question' && (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                           <HelpCircle className="w-3 h-3" /> Question
                        </span>
                     )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {post.location}</p>
                </div>
              </div>

              {/* Image */}
              <div className="aspect-square bg-gray-100 relative">
                <img src={post.image} className="w-full h-full object-cover" />
              </div>

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
                  {post.tags.map(tag => (
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

          {MARKET_LISTINGS.map((item) => (
            <Card key={item.id} className="flex overflow-hidden shadow-sm border border-gray-100 hover:border-green-300 transition-colors cursor-pointer group">
               {/* Left: Image */}
               <div className="w-1/3 relative">
                 <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                       <img src={item.seller.avatar} className="w-4 h-4 rounded-full" />
                       <span className="text-xs text-gray-500 truncate">{item.seller.name}</span>
                       {item.seller.verifiedGrower && <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 w-fit px-2 py-1 rounded-md mb-2">
                       <Leaf className="w-3 h-3" />
                       Verified Log: {item.plantingLogs} days
                    </div>
                 </div>

                 <div className="flex justify-end">
                    <Button size="sm" className="bg-gray-900 text-white h-8 text-xs hover:bg-green-600 transition-colors w-full">
                       Buy Now
                    </Button>
                 </div>
               </div>
            </Card>
          ))}
        </div>
      )}

      {/* FAB: Create Post (Only on Feed Tab) */}
      {activeTab === 'feed' && (
        <div className="fixed bottom-24 right-6 z-30">
          <Button 
            onClick={() => setIsCreating(true)}
            className="h-14 w-14 rounded-full bg-gray-900 hover:bg-green-600 shadow-xl flex items-center justify-center transition-all hover:scale-105"
          >
            <Plus className="w-7 h-7 text-white" />
          </Button>
        </div>
      )}

      {/* CREATE POST MODAL (Portal) */}
      {isCreating && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <Card className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold">Create Post</h3>
                 <button onClick={() => setIsCreating(false)} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 space-y-4">
                 {/* Post Type Selector in Modal */}
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 border-green-200 bg-green-50 text-green-700">
                        <Camera className="w-4 h-4 mr-2" /> Showcase
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                        <HelpCircle className="w-4 h-4 mr-2" /> Ask Question
                    </Button>
                 </div>

                 <Input 
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Share your progress or ask a question..."
                    className="border-0 text-lg px-0 focus-visible:ring-0 placeholder:text-gray-400"
                 />
                 
                 <div className="aspect-video bg-gray-50 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm">Add Photo</span>
                 </div>
                 
                 <Button className="w-full bg-green-600 hover:bg-green-700 h-12" onClick={() => setIsCreating(false)}>
                    Post to Community
                 </Button>
              </div>
           </Card>
        </div>,
        document.body
      )}
    </div>
  );
}