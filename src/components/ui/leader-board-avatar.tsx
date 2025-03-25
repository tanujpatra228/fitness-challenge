"use client"
import { LeaderboardEntry } from "@/src/services/progress.services";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { getAvatar } from "@/src/lib/userAvatars";

const LeaderboardAvatar = ({ entry, index }: { entry: LeaderboardEntry, index: number }) => {
    // Function to determine if position gets a podium icon
    const isPodiumPosition = (position: number) => {
        return position <= 2; // Index 0, 1, 2 = 1st, 2nd, 3rd place
    };

    // Function to get podium badge background color
    const getPodiumBadgeColor = (position: number) => {
        switch (position) {
            case 0: // 1st place
                return "bg-amber-400"; // Gold
            case 1: // 2nd place
                return "bg-slate-300"; // Silver
            case 2: // 3rd place
                return "bg-amber-700"; // Bronze
            default:
                return "bg-slate-200";
        }
    };

    return (
        <div className="relative">
            <Avatar>
                <AvatarImage
                    className="bg-slate-500"
                    src={getAvatar(entry.profile.avatar_id).src}
                />
                <AvatarFallback className="uppercase">
                    {entry.profile.display_name.charAt(0)}
                </AvatarFallback>
            </Avatar>

            {/* Trophy icon for podium positions (top 3 only) */}
            {isPodiumPosition(index) && (
                <div className={`w-5 h-5 rounded-full ${getPodiumBadgeColor(index)} flex items-center justify-center text-xs font-bold absolute -top-1 -right-1 border border-white text-white`}>
                    {/* Trophy icon - you can replace this with an actual icon component */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743-.356l1.108-.393V16.5a2.25 2.25 0 0 1-2.25 2.25h-3a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-3a2.25 2.25 0 0 1-2.25-2.25V9.742l1.109.392a6.73 6.73 0 0 0 2.743.357 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.86 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default LeaderboardAvatar;