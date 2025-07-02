"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Mention from "@tiptap/extension-mention";
import { motion, AnimatePresence } from "framer-motion";

import { EditorToolbar } from "./editor-toolbar";
import { MentionList } from "./mention-list";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  documentId?: string | null;
  autoSave?: boolean;
  className?: string;
  readOnly?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  documentId,
  autoSave = true,
  className,
  readOnly = false,
}: RichTextEditorProps) {
  const { isAutoSaving, lastAutoSave } = useUIStore();
  const { saveNow } = useAutoSave(documentId, content, autoSave && !readOnly);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      CharacterCount,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: async ({ query }) => {
            // This would normally fetch users from your API
            // For now, return mock data
            const users = [
              { id: "1", username: "john_doe", name: "John Doe" },
              { id: "2", username: "jane_smith", name: "Jane Smith" },
              { id: "3", username: "bob_wilson", name: "Bob Wilson" },
            ];

            return users
              .filter(
                (user) =>
                  user.username.toLowerCase().includes(query.toLowerCase()) ||
                  user.name.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
          render: () => {
            let component: any;
            let popup: any;

            return {
              onStart: (props: any) => {
                component = new MentionList({
                  props,
                  editor,
                });

                if (!props.clientRect) {
                  return;
                }

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },
              onUpdate(props: any) {
                component.updateProps(props);

                if (!props.clientRect) {
                  return;
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  popup[0].hide();
                  return true;
                }

                return component.onKeyDown(props);
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onChange(newContent);

      // Update word and character counts
      setWordCount(editor.storage.characterCount.words());
      setCharacterCount(editor.storage.characterCount.characters());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      setWordCount(editor.storage.characterCount.words());
      setCharacterCount(editor.storage.characterCount.characters());
    }
  }, [editor]);

  const handleManualSave = async () => {
    if (saveNow) {
      try {
        await saveNow();
      } catch (error) {
        console.error("Manual save failed:", error);
      }
    }
  };

  if (!editor) {
    return (
      <div className="min-h-[400px] w-full animate-pulse bg-muted rounded-lg" />
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {!readOnly && (
        <EditorToolbar
          editor={editor}
          onSave={handleManualSave}
          isSaving={isAutoSaving}
        />
      )}

      <div
        ref={editorRef}
        className={cn(
          "relative min-h-[400px] w-full rounded-lg border bg-background",
          readOnly && "border-none bg-transparent p-0"
        )}
      >
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm max-w-none focus:outline-none",
            !readOnly && "p-4",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
            "prose-p:leading-relaxed prose-li:leading-relaxed",
            "prose-blockquote:border-l-primary prose-blockquote:italic",
            "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
            "prose-pre:bg-muted prose-pre:border",
            "dark:prose-invert"
          )}
        />

        {/* Auto-save indicator */}
        <AnimatePresence>
          {!readOnly && (isAutoSaving || lastAutoSave) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 border"
            >
              {isAutoSaving ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : lastAutoSave ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>
                    Saved{" "}
                    {new Date(lastAutoSave).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Statistics */}
      {!readOnly && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
          </div>
          {lastAutoSave && (
            <span>
              Last saved{" "}
              {new Date(lastAutoSave).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
