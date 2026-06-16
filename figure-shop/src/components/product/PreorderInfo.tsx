type PreorderInfoProps = {
  isPreorder: boolean;
};

export function PreorderInfo({ isPreorder }: PreorderInfoProps) {
  if (!isPreorder) {
    return null;
  }

  return (
    <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <p className="font-semibold">Thong tin pre-order</p>
      <p className="mt-2 leading-6">
        San pham nay dang nhan dat truoc. Thoi gian ve hang co the thay doi tuy
        theo lich phat hanh va nha phan phoi. Cua hang se lien he xac nhan truoc
        khi giao hang.
      </p>
    </div>
  );
}