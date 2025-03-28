const avatars = [
    {
        id: 'fm1',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/w023geq40prfw6hw8frd'
    },
    {
        id: 'fm2',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/mzdfy0qlpmjffo1qp06d'
    },
    {
        id: 'fm3',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/zcvkay8lcs0ry2qmmxwn'
    },
    {
        id: 'fm4',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/m0j62jierfoktawrdcvs'
    },
    {
        id: 'fm5',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/twpif9vqsm8yypr3qqb8'
    },
    {
        id: 'm1',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/vb7qjry383swjywpcfol'
    },
    {
        id: 'm2',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/qdk9j6ghezsusnbpa6jm'
    },
    {
        id: 'm3',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/ohuurr57mfkmwpxsmmmo'
    },
    {
        id: 'm4',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/lwzmznfxpzsxlwrwao8d'
    },
    {
        id: 'm5',
        src: 'https://res.cloudinary.com/dopcbgrcs/image/upload/{{wh}},f_auto,q_auto/v1/apps/fitness-challenger/user-avatars/ehoh1fgntm6cxvuujw3p'
    },
];

/**
 * Get avatar
 * @param profile - profile
 * @returns avatar
 */
export const getAvatar = (profile: ProfileWithAvatar) => {
    return profile?.avatar_url || getAvatarById(profile.avatar_id).src;
}

/**
 * Get avatar by id
 * @param id - id of the avatar
 * @returns avatar
 */
export const getAvatarById = (id: string, size?: number) => {
    const avatar = avatars.find((avatar) => avatar.id === id) || avatars[0];
    return {
        ...avatar,
        src: avatar.src.replace('{{wh}}', `w_${size || 65},h_${size || 65}`)
    }
}

/**
 * shuffle avatars
 * @param avatars - avatars to shuffle
 * @returns shuffled avatars
 */
const shuffleAvatars = (avatars: { id: string, src: string }[]) => {
    return avatars.sort(() => Math.random() - 0.5);
}

/**
 * Get random avatar based on gender
 * @param gender - gender of the avatar
 * @returns avatar
 */
export const getAvatarList = (gender: 'male' | 'female', size?: number) => {
    const genderPrefix = gender === 'male' ? 'm' : 'fm';
    const avatarsList = avatars.filter((avatar) => avatar.id.startsWith(genderPrefix));
    return shuffleAvatars(avatarsList.map((avatar) => ({
        ...avatar,
        src: avatar.src.replace('{{wh}}', `w_${size || 65},h_${size || 65}`)
    })));
}
