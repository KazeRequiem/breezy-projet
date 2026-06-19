export const USE_MOCK = false;

// Données simulées d'utilisateurs
export const MOCK_USERS = {
    baptistenoisette: {
        id_user: 1,
        username: 'baptistenoisette',
        email: 'baptiste@exemple.com',
        role: 'admin',
        bio: 'Dev web, café addict et explorateur de code propre. Paris.',
        location: 'Paris, France',
        banner_color: '#e88a8a',
        breezes_count: 6,
        followers_count: 286,
        following_count: 379,
    },
    camille_lrt: {
        id_user: 2,
        username: 'camille_lrt',
        email: 'camille@exemple.com',
        role: 'user',
        bio: 'Product Designer & passionnée d\'interfaces fluides. 🎨✨',
        location: 'Lyon, France',
        banner_color: 'linear-gradient(135deg, #b490ca 0%, #e88a8a 100%)',
        breezes_count: 2,
        followers_count: 412,
        following_count: 188,
    },
    tommrc: {
        id_user: 3,
        username: 'tommrc',
        email: 'tom@exemple.com',
        role: 'user',
        bio: 'Fullstack Dev | Fan de React & Node.js. Codeur nocturne.',
        location: 'Nantes, France',
        banner_color: 'linear-gradient(135deg, #7ec8e3 0%, #3b8cf0 100%)',
        breezes_count: 1,
        followers_count: 98,
        following_count: 145,
    },
    leaft_: {
        id_user: 4,
        username: 'leaft_',
        email: 'leaft@exemple.com',
        role: 'user',
        bio: 'Créateur de solutions CSS élégantes et d\'animations fluides.',
        location: 'Bordeaux, France',
        banner_color: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)',
        breezes_count: 1,
        followers_count: 154,
        following_count: 89,
    },
    noah_brd: {
        id_user: 5,
        username: 'noah_brd',
        email: 'noah@exemple.com',
        role: 'user',
        bio: 'Étudiant en informatique & curieux de tout. Tech lover.',
        location: 'Lille, France',
        banner_color: 'linear-gradient(135deg, #FBD3E9 0%, #BB9FDF 100%)',
        breezes_count: 1,
        followers_count: 67,
        following_count: 132,
    }
};

// Données simulées des publications (posts principaux et commentaires)
export const DEMO_POSTS = [
    {
        id_message: 1,
        content: "Première sortie avec la nouvelle UI Breezy 🌊 C'est propre, fluide, coloré. Exactement ce qu'on voulait.",
        date_publication: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        likes_count: 24,
        replies_count: 2,
        tags: ['Breezy', 'UIDesign'],
        reply_to: null,
        media: {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
            type: "image"
        },
        animDelay: '',
    },
    {
        id_message: 2,
        content: "Trop d'accord ! Le fond qui change doucement c'est mon détail préféré. Ça donne vraiment vie à l'appli ✨",
        date_publication: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
        likes_count: 11,
        replies_count: 0,
        tags: ['UI', 'Design'],
        reply_to: { id_message: 1, author: { id_user: 1, username: 'baptistenoisette' } },
        animDelay: 'anim-delay-1',
    },
    {
        id_message: 3,
        content: "Quelqu'un a remarqué que le background change en permanence ? C'est subtil mais trop sympa 👀",
        date_publication: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        likes_count: 47,
        replies_count: 1,
        tags: ['WebDev', 'React'],
        reply_to: null,
        animDelay: 'anim-delay-2',
    },
    {
        id_message: 4,
        content: "Oui ! C'est une animation CSS sur le background, ça tourne en boucle. Le détail fait vraiment la différence.",
        date_publication: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
        author: { id_user: 4, username: 'leaft_', profile_picture: null },
        likes_count: 9,
        replies_count: 0,
        tags: ['CSS', 'Animation'],
        reply_to: { id_message: 3, author: { id_user: 3, username: 'tommrc' } },
        animDelay: 'anim-delay-3',
    },
    {
        id_message: 5,
        content: "Est-ce qu'il y aura un mode sombre ? Le fond holographique est beau mais parfois un peu lumineux la nuit 🌙",
        date_publication: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        author: { id_user: 5, username: 'noah_brd', profile_picture: null },
        likes_count: 8,
        replies_count: 0,
        tags: ['Feedback'],
        reply_to: null,
        animDelay: 'anim-delay-4',
    },
    {
        id_message: 6,
        content: "Absolument d'accord pour la fluidité, le scroll ne saccade pas du tout !",
        date_publication: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        likes_count: 5,
        replies_count: 0,
        tags: [],
        reply_to: { id_message: 1, author: { id_user: 1, username: 'baptistenoisette' } },
        animDelay: 'anim-delay-1',
    },
    // Posts supplémentaires pour baptistenoisette
    {
        id_message: 201,
        content: "Breezy est rapide et léger — exactement ce qu'il faut pour coder depuis un café avec du mauvais wifi.",
        date_publication: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        likes_count: 28,
        replies_count: 2,
        tags: ['Breezy', 'Dev'],
        reply_to: null,
    },
    {
        id_message: 2011,
        content: "Tellement vrai ! Un bon café et du code, le paradis ☕💻",
        date_publication: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
        reply_to: { id_message: 201, author: { id_user: 1, username: 'baptistenoisette' } }
    },
    {
        id_message: 2012,
        content: "Et le mode offline, vous y avez pensé ?",
        date_publication: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        reply_to: { id_message: 201, author: { id_user: 1, username: 'baptistenoisette' } }
    },
    {
        id_message: 202,
        content: 'JWT courte durée + refresh token = le combo parfait pour vos APIs. Ne faites pas confiance aux sessions longues.',
        date_publication: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        likes_count: 2,
        replies_count: 4,
        tags: ['WebDev', 'Tech'],
        reply_to: null,
    },
    {
        id_message: 2021,
        content: "Tout à fait d'accord, la sécurité avant tout !",
        date_publication: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        reply_to: { id_message: 202, author: { id_user: 1, username: 'baptistenoisette' } }
    },
    {
        id_message: 2022,
        content: "Tu utilises quoi pour gérer le refresh token côté client ?",
        date_publication: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 4, username: 'leaft_', profile_picture: null },
        reply_to: { id_message: 202, author: { id_user: 1, username: 'baptistenoisette' } }
    },
    {
        id_message: 2023,
        content: "Un article de blog sur le sujet bientôt ?",
        date_publication: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 5, username: 'noah_brd', profile_picture: null },
        reply_to: { id_message: 202, author: { id_user: 1, username: 'baptistenoisette' } }
    },
    {
        id_message: 2024,
        content: "Perso je stocke le refresh token en httpOnly cookie. Le plus sûr.",
        date_publication: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 12, username: 'hugo_designer', profile_picture: null },
        reply_to: { id_message: 202, author: { id_user: 1, username: 'baptistenoisette' } }
    },
    {
        id_message: 203,
        content: "Dark mode = moins de fatigue oculaire. Light mode = les utilisateurs qui confondent leur écran avec une fenêtre. 😂",
        date_publication: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        likes_count: 1037,
        replies_count: 0,
        tags: ['UIDesign', 'Design'],
        reply_to: null,
    },
    // Posts supplémentaires pour camille_lrt
    {
        id_message: 302,
        content: "En train de bosser sur les maquettes du profil utilisateur... Le glassmorphism rend tellement bien sur grand écran.",
        date_publication: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
        likes_count: 45,
        replies_count: 0,
        tags: ['UIDesign', 'Breezy'],
        reply_to: null,
    }
];

// Helper pour récupérer les infos complètes d'un profil et ses posts associés
export function getMockUser(username) {
    if (!username) return null;
    const key = username.toLowerCase();
    const user = MOCK_USERS[key];
    if (!user) return null;

    // Récupérer tous les posts dont l'auteur est cet utilisateur
    const userPosts = DEMO_POSTS.filter(post => 
        post.author.username.toLowerCase() === key
    );

    return {
        ...user,
        posts: userPosts
    };
}

// Helper pour simuler la connexion
export async function mockLogin(email) {
    await new Promise(resolve => setTimeout(resolve, 600));

    // Cherche si l'email correspond à un de nos utilisateurs mockés
    let matchedUser = Object.values(MOCK_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
        // Fallback intelligent en fonction de l'adresse saisie
        if (email.toLowerCase().includes('admin')) {
            matchedUser = MOCK_USERS.baptistenoisette;
        } else {
            matchedUser = MOCK_USERS.camille_lrt;
        }
    }

    return {
        token: 'mock-jwt-token-xyz123',
        user: {
            id_user: matchedUser.id_user,
            username: matchedUser.username,
            email: matchedUser.email,
            role: matchedUser.role,
        }
    };
}

// Helper pour simuler l'inscription
export async function mockRegister(username, email, password, biography) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // On ajoute temporairement cet utilisateur à notre liste pour les tests manuels
    const newUserId = Object.keys(MOCK_USERS).length + 1;
    const formattedUsername = username.trim().replace(/\s+/g, '_');
    
    MOCK_USERS[formattedUsername.toLowerCase()] = {
        id_user: newUserId,
        username: formattedUsername,
        email: email,
        role: 'user',
        bio: biography || 'Nouvel utilisateur sur Breezy ! 🌬️',
        location: 'Inconnue',
        banner_color: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)',
        breezes_count: 0,
        followers_count: 0,
        following_count: 0
    };

    return {
        id_user: newUserId,
        username: formattedUsername,
        email: email,
        role: 'user',
    };
}
