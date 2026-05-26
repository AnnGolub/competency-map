"use client";

export function FeedbackTab({ designerId }: { designerId: string }) {
  return (
    <div style={{ marginTop: "40px", color: "#8F90A6" }} data-designer-id={designerId}>
      Обратная связь пока не собрана
    </div>
  );
}
