const avatarColors = [
    { bg: '#E3F2FD', color: '#1976D2' },
    { bg: '#F3E5F5', color: '#7B1FA2' },
    { bg: '#E8F5E9', color: '#388E3C' },
    { bg: '#FFF3E0', color: '#F57C00' },
    { bg: '#FCE4EC', color: '#C2185B' },
    { bg: '#E0F2F1', color: '#00796B' },
];

export const getAvatarColor = (firstName: string, lastName: string) => {
    const index = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % avatarColors.length;
    return avatarColors[index];
};
