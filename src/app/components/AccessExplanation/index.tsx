'use client';
// import styles from './codeView.module.css';


export default function AccessExplanation({ path, allowRules, functions }) {
    const rulesForPath = allowRules.filter(r => r.path === path);
    const functionNames = functions.map(f => f.name);

    if (!rulesForPath.length) return null;

    const explanation = rulesForPath.map(({ method, condition }) => {
        let line = `Users can **${method}** this document if ${condition}`;
        functionNames.forEach(fn => {
            if (condition.includes(fn)) {
                line = line.replace(fn, `**${fn}**`);
            }
        });
        return line;
    });

    const inferredEntity = path.split('/').slice(-2, -1)[0];
    const full = [`This path represents a "${inferredEntity}" document.`, ...explanation];

    return (
        <div style={{ backgroundColor: '#f0f7ff', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Access Summary</h4>
            <div
                dangerouslySetInnerHTML={{
                    __html: full.join('<br/>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
                }}
            />
        </div>
    );
}
