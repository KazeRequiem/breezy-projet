function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        biography: user.biography,
        profile_picture: user.profile_picture,
        role: user.role,
        tags: user.tags,
        createdAt: user.createdAt,
    };
}

function selfUser(user) {
    return {
        ...publicUser(user),
        email: user.email,
    };
}

module.exports = { publicUser, selfUser };