import styles from "./FormattedDescription.module.css";
const inline = (text) =>
  text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("*") && part.endsWith("*") ? (
        <em key={index}>{part.slice(1, -1)}</em>
      ) : (
        part
      ),
    );
export default function FormattedDescription({ text }) {
  const lines = text.split(/\r?\n/),
    blocks = [];
  for (let i = 0; i < lines.length; ) {
    const value = lines[i].trim();
    if (!value) {
      i += 1;
      continue;
    }
    if (value.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push(
        <ul key={`l-${i}`}>
          {items.map((item, index) => (
            <li key={index}>{inline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (value.startsWith("### "))
      blocks.push(<h4 key={i}>{inline(value.slice(4))}</h4>);
    else if (value.startsWith("## "))
      blocks.push(<h3 key={i}>{inline(value.slice(3))}</h3>);
    else if (value.startsWith("# "))
      blocks.push(<h2 key={i}>{inline(value.slice(2))}</h2>);
    else blocks.push(<p key={i}>{inline(value)}</p>);
    i += 1;
  }
  return <div className={styles.formatted}>{blocks}</div>;
}
