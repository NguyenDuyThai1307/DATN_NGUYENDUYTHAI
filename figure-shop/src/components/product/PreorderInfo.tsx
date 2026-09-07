type PreorderInfoProps = {
  isPreorder: boolean;
};

export function PreorderInfo({ isPreorder }: PreorderInfoProps) {
  if (!isPreorder) {
    return null;
  }

  return (
    <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <p className="font-semibold">Thông tin pre-order</p>
      <p className="mt-2 leading-6">
        Sản phẩm này đang nhận đặt trước. Thời gian về hàng có thể thay đổi tùy
        theo lịch phát hành và nhà phân phối. Cửa hàng sẽ liên hệ xác nhận trước
        khi giao hàng.
      </p>
    </div>
  );
}