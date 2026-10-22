// Ardenne High School version of the document editor: official look, A4 pages, school letterhead,
// assignment details, page setup, header and footer with page numbers, and word limits.
import DocEditorCore from './DocEditorCore';

export default function ArdenneDocEditor(props) {
  return <DocEditorCore variant="ardenne" {...props} />;
}
