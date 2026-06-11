import PostCard from '../PostCard/PostCard'
import styles from './PostThreadGroup.module.css'

/**
 * PostThreadGroup : Groupe visuel "post parent + réponse(s)".
 * Relie visuellement le post original et ses réponses avec une ligne
 * verticale qui traverse les avatars.
 *
 * Les coins des cartes s'ajustent :
 *   Post parent    : coins bas arrondis → plats (soudés à la ligne)
 *   Réponses       : coins haut plats → arrondis (soudés à la ligne)
 *   Dernière réponse : coins bas à nouveau arrondis
 *
 * @param {object}   root     - Post racine (reply_to === null)
 * @param {Array}    replies  - Posts répondant au post racine
 */
function PostThreadGroup({ root, replies }) {
    return (
        <div className={styles.threadGroup}>
            {/* Post parent */}
            <PostCard
                post={root}
                threadVariant="root"
                animDelay={root.animDelay}
            />

            {/* Ligne de connexion + réponses */}
            {replies.map((reply, index) => {
                const isLast = index === replies.length - 1
                return (
                    <div key={reply.id_message} className={styles.replyBlock}>
                        {/* Ligne verticale (centrée sur la colonne avatar = 34px) */}
                        <div className={styles.connector} aria-hidden="true">
                            <div className={styles.connectorLine} />
                        </div>

                        <PostCard
                            post={reply}
                            threadVariant={isLast ? 'reply-last' : 'reply'}
                            animDelay={reply.animDelay}
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default PostThreadGroup
