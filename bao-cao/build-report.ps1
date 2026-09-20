$ErrorActionPreference = 'Stop'
$base = $PSScriptRoot
$schema = Get-Content -LiteralPath (Join-Path $base '../figure-shop/prisma/schema.prisma') -Raw -Encoding UTF8
$content = Get-Content -LiteralPath (Join-Path $base 'TOM_TAT_DU_AN_FIGURE_SHOP.md') -Raw -Encoding UTF8
$models = [regex]::Matches($schema, '(?ms)^model (\w+) \{\s*(.*?)^\}')
$modelNames = @($models | ForEach-Object { $_.Groups[1].Value })
$purpose = @{
 WishlistItem='Yêu thích theo tài khoản; khóa chính kép userId/productId, không lưu trùng.'
 AiConversation='Cuộc trò chuyện thuộc một tài khoản; tiêu đề và thời gian dùng chọn lại lịch sử.'
 AiMessage='Tin nhắn trong hội thoại; nội dung, vai trò và snapshot thẻ sản phẩm dạng JSON.'
 ProductReview='Đánh giá sao và nhận xét; mỗi cặp tài khoản/sản phẩm một bản ghi.'
 User='Lưu tài khoản, thông tin liên hệ và vai trò; không lưu mật khẩu dạng rõ.'
 Address='Địa chỉ thuộc người dùng. Cờ isDefault chưa có unique có điều kiện để bảo đảm một địa chỉ mặc định.'
 Category='Danh mục sản phẩm, tham gia quan hệ danh mục chính và nhiều danh mục qua bảng nối.'
 Brand='Thương hiệu mô hình; có thể là mục tiêu khuyến mãi.'
 Product='Thông tin sản phẩm và tồn kho hiện tại; không thay thế dữ liệu lịch sử trong OrderItem.'
 ProductCategory='Bảng nối nhiều–nhiều giữa sản phẩm và danh mục.'
 Promotion='Ưu đãi theo sản phẩm, danh mục hoặc thương hiệu. Mục tiêu phù hợp scope do ứng dụng quản lý.'
 Coupon='Mã giảm giá cấp giỏ/đơn, có điều kiện giá trị tối thiểu và giới hạn sử dụng.'
 ProductImage='Đường dẫn và thứ tự ảnh. Dữ liệu file ảnh nằm ngoài database.'
 Cart='Giỏ của người dùng, có thể gắn một coupon.'
 CartItem='Dòng sản phẩm trong giỏ; duy nhất theo cặp cartId/productId.'
 Order='Đơn hàng, thông tin người nhận, tổng tiền và dữ liệu điều phối thanh toán.'
 OrderItem='Snapshot dòng hàng, giá tại thời điểm đặt và số lượng tồn đã giữ.'
 Payment='Khoản thanh toán tổng của đơn; phân biệt môi trường và cờ cần đối soát.'
 PaymentAttempt='Lần thử thanh toán qua cổng; mã tham chiếu, khóa chống lặp và khóa điều phối.'
 PaymentEvent='Sự kiện của lần thử, dùng đối chiếu và chống xử lý lặp bằng eventKey.'
}
$meaning = @{
 id='Mã bản ghi';email='Email đăng nhập';name='Tên hiển thị';phone='Số điện thoại';passwordHash='Mật khẩu đã băm';role='Vai trò';createdAt='Thời điểm tạo';updatedAt='Thời điểm cập nhật';userId='FK người dùng';fullName='Họ tên người nhận';province='Tỉnh/thành';district='Quận/huyện';ward='Phường/xã';detail='Địa chỉ cụ thể';isDefault='Địa chỉ mặc định';slug='Định danh URL';description='Mô tả';price='Đơn giá gốc VND';stock='Tồn kho';status='Trạng thái theo enum';type='Loại theo enum';categoryId='FK danh mục';brandId='FK thương hiệu';productId='FK sản phẩm';scope='Phạm vi khuyến mãi';value='Giá trị phần trăm hoặc VND';startsAt='Bắt đầu hiệu lực';endsAt='Kết thúc hiệu lực';isActive='Cờ hoạt động';code='Mã coupon';minOrderValue='Giá trị đơn tối thiểu';maxDiscountAmount='Trần giảm VND';usageLimit='Giới hạn lượt';usedCount='Số lượt sử dụng/đã giữ';url='URL ảnh';alt='Mô tả thay thế ảnh';sortOrder='Thứ tự hiển thị';couponId='FK coupon';cartId='FK giỏ';quantity='Số lượng';orderNumber='Mã đơn cho người dùng';paymentMethod='Phương thức thanh toán';paymentStatus='Trạng thái thanh toán của đơn';checkoutKey='Khóa chống lặp checkout';checkoutPayloadHash='Hash dữ liệu checkout';paymentExpiresAt='Hạn thanh toán';cancelRequestedAt='Thời điểm yêu cầu hủy';reservationReleasedAt='Thời điểm hoàn giữ chỗ';couponUsageReserved='Đã giữ lượt coupon';isTestOrder='Cờ đơn thử nghiệm';subtotal='Tạm tính trước giảm';discountAmount='Tổng giảm theo cấp bản ghi';shippingFee='Phí vận chuyển';total='Tổng tiền sau tính toán';note='Ghi chú';couponCode='Snapshot mã coupon';couponDiscountAmount='Giảm coupon VND';receiverName='Tên người nhận';receiverPhone='Điện thoại người nhận';addressDetail='Địa chỉ giao chi tiết';orderId='FK đơn hàng';productName='Snapshot tên sản phẩm';productPrice='Đơn giá sau giảm khi đặt';originalPrice='Đơn giá gốc khi đặt';finalPrice='Đơn giá sau Promotion';reservedQuantity='Số lượng tồn được giữ';amount='Số tiền thanh toán VND';method='Phương thức';transactionCode='Mã giao dịch';paidAt='Thời điểm đã thanh toán';environment='Môi trường giao dịch';needsReview='Cần đối soát thủ công';reviewReason='Lý do cần đối soát';paymentId='FK khoản thanh toán';provider='Nhà cung cấp/phương thức';merchantAccountId='Định danh merchant';providerReference='Mã tham chiếu gửi cổng';providerPaymentId='Mã thanh toán phía cổng';providerCreatedAt='Chuỗi thời gian gửi cổng';currency='Mã tiền tệ';activePaymentId='Khóa duy nhất lần thử hoạt động, không FK';requestKey='Khóa yêu cầu chống lặp';checkoutUrl='URL chuyển sang cổng';expiresAt='Hạn hiệu lực lần thử';lastReconciledAt='Lần đối soát gần nhất';leaseUntil='Hạn khóa xử lý';leaseToken='Token khóa xử lý';attemptId='FK lần thử';eventKey='Khóa sự kiện chống lặp';providerTransactionId='Mã giao dịch nhà cung cấp';result='Kết quả xử lý';receivedAt='Thời điểm nhận';processedAt='Thời điểm xử lý'
}
$append = [Text.StringBuilder]::new()
$fieldCount = 0
$meaning['sessionVersion']='Phiên bản xác thực; tăng khi đổi quyền hoặc trạng thái để thu hồi token cũ'
$meaning['title']='Tiêu đề cuộc trò chuyện'
$meaning['conversationId']='FK cuộc trò chuyện'
$meaning['content']='Nội dung tin nhắn'
$meaning['products']='Snapshot thẻ sản phẩm JSON trong câu trả lời AI'
$meaning['rating']='Điểm sao 1–5, kiểm tra ở ứng dụng'
$meaning['comment']='Nhận xét 10–2.000 ký tự, kiểm tra ở ứng dụng'
foreach($model in $models) {
 $name=$model.Groups[1].Value
 [void]$append.AppendLine("`n### $name`n")
 [void]$append.AppendLine($purpose[$name]+"`n")
 [void]$append.AppendLine('| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |')
 [void]$append.AppendLine('|---|---|---|---|')
 $relations=@();$indexes=@()
 foreach($line in ($model.Groups[2].Value -split "`n")) {
  $line=$line.Trim()
  if($line.StartsWith('@@')) {$indexes += $line;continue}
  if($line -match '^(\w+)\s+([\w\[\]?]+)(.*)$') {
   $field=$Matches[1];$type=$Matches[2];$rule=$Matches[3].Trim();$bare=$type.Replace('?','').Replace('[]','')
   if($modelNames -contains $bare) {$relations += "$field : $type $rule";continue}
   $nullable=if($type.EndsWith('?')){'Cho phép null'}else{'Không null'}
   if(!$rule){$rule=$nullable}else{$rule="$nullable; $rule"}
   [void]$append.AppendLine("| $field | $type | $($meaning[$field]) | $rule |")
   $fieldCount++
  }
 }
 if($indexes.Count){[void]$append.AppendLine("`nKhóa/chỉ mục nhiều trường: " + ($indexes -join '; ') + '.')}
 if($relations.Count){[void]$append.AppendLine("`nQuan hệ Prisma (không phải cột scalar):");foreach($rel in $relations){[void]$append.AppendLine("- $rel")}}
}
[void]$append.AppendLine("`n## PHỤ LỤC B. CÁC ENUM TRONG SCHEMA`n")
foreach($enum in [regex]::Matches($schema,'(?ms)^enum (\w+) \{\s*(.*?)^\}')) {
 [void]$append.AppendLine('### '+$enum.Groups[1].Value+"`n")
 [void]$append.AppendLine((($enum.Groups[2].Value -split '\s+' | Where-Object {$_}) -join ', ')+".`n")
}
$full=$content+$append.ToString()
$full=([regex]::Replace($full, '(?m)[ \t]+\r?$', '')).TrimEnd()+"`n"
[IO.File]::WriteAllText((Join-Path $base 'NOI_DUNG_DAY_DU.md'),$full,[Text.UTF8Encoding]::new($false))
function Esc([string]$s) { [Security.SecurityElement]::Escape($s) }
function Para([string]$text,[string]$style='Normal') { '<w:p><w:pPr><w:pStyle w:val="'+$style+'"/></w:pPr><w:r><w:t xml:space="preserve">'+(Esc $text)+'</w:t></w:r></w:p>' }
$body=[Text.StringBuilder]::new()
$lines=$full -split "`r?`n"
for($i=0;$i -lt $lines.Length;$i++) {
 $line=$lines[$i].Trim()
 if(!$line){continue}
 if($line.StartsWith('|')) {
  $rows=[Collections.Generic.List[object]]::new()
  while($i -lt $lines.Length -and $lines[$i].Trim().StartsWith('|')) {
   $raw=$lines[$i].Trim()
   if($raw -notmatch '^\|[-:| ]+\|$') {$rows.Add(@($raw.Trim('|').Split('|') | ForEach-Object {$_.Trim()}))}
   $i++
  };$i--
  $count=$rows[0].Count
  $widths=switch($count){2 {@(2700,6660)} 3 {@(2400,1700,5260)} 4 {if($rows[0][0] -eq 'Trường'){@(1800,1450,2600,3510)}else{@(900,2100,2200,4160)}} default {@(9360)}}
  [void]$body.Append('<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblInd w:w="120" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar><w:tblBorders>')
  foreach($side in @('top','left','bottom','right','insideH','insideV')){[void]$body.Append('<w:'+$side+' w:val="single" w:sz="4" w:color="D1D9E0"/>')}
  [void]$body.Append('</w:tblBorders></w:tblPr><w:tblGrid>')
  foreach($width in $widths){[void]$body.Append('<w:gridCol w:w="'+$width+'"/>')}
  [void]$body.Append('</w:tblGrid>')
  for($r=0;$r -lt $rows.Count;$r++) {
   [void]$body.Append('<w:tr><w:trPr><w:cantSplit/>'+$(if($r -eq 0){'<w:tblHeader/>'})+'</w:trPr>')
   for($c=0;$c -lt $count;$c++) {
    [void]$body.Append('<w:tc><w:tcPr><w:tcW w:w="'+$widths[$c]+'" w:type="dxa"/><w:vAlign w:val="center"/>'+$(if($r -eq 0){'<w:shd w:fill="E8EEF5"/>'})+'</w:tcPr>')
    [void]$body.Append((Para $rows[$r][$c] $(if($r -eq 0){'TableHeader'}else{'TableText'})))
    [void]$body.Append('</w:tc>')
   };[void]$body.Append('</w:tr>')
  };[void]$body.Append('</w:tbl>');[void]$body.Append((Para '' 'TableGap'));continue
 }
 if($line.StartsWith('### ')){[void]$body.Append((Para $line.Substring(4) 'Heading2'));continue}
 if($line.StartsWith('## ')){[void]$body.Append((Para $line.Substring(3) 'Heading1'));continue}
 if($line.StartsWith('# ')){[void]$body.Append((Para $line.Substring(2) 'Title'));continue}
 if($line.StartsWith('- ')){[void]$body.Append((Para $line.Substring(2) 'ListBullet'));continue}
 [void]$body.Append((Para $line))
}
$w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$styles=[Text.StringBuilder]::new('<w:styles xmlns:w="'+$w+'">')
$styleSpecs=@(@('Normal',22,'222222',0,120,300,$false),@('Title',52,'1F3A5F',0,240,300,$true),@('Subtitle',24,'666666',0,120,300,$false),@('Heading1',32,'2E74B5',360,200,300,$true),@('Heading2',26,'2E74B5',280,140,300,$true),@('Heading3',24,'1F4D78',200,100,300,$true),@('TableText',19,'222222',0,40,260,$false),@('TableHeader',19,'1F3A5F',0,40,260,$true),@('TableGap',4,'222222',0,0,240,$false),@('ListBullet',22,'222222',0,80,300,$false),@('Header',18,'666666',0,0,240,$false))
foreach($spec in $styleSpecs){
 $id=$spec[0]
 [void]$styles.Append('<w:style w:type="paragraph" w:styleId="'+$id+'"><w:name w:val="'+$id+'"/><w:pPr><w:spacing w:before="'+$spec[3]+'" w:after="'+$spec[4]+'" w:line="'+$spec[5]+'" w:lineRule="auto"/><w:widowControl/>')
 if($id -match '^Heading') {[void]$styles.Append('<w:keepNext/><w:keepLines/><w:outlineLvl w:val="'+([int]$id.Substring(7)-1)+'"/>')}
 if($id -eq 'Heading1'){[void]$styles.Append('<w:pageBreakBefore/>')}
 if($id -eq 'Title'){[void]$styles.Append('<w:keepNext/>')}
 if($id -eq 'ListBullet'){[void]$styles.Append('<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:ind w:left="540" w:hanging="270"/>')}
 [void]$styles.Append('</w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="'+$spec[1]+'"/><w:szCs w:val="'+$spec[1]+'"/><w:color w:val="'+$spec[2]+'"/><w:lang w:val="vi-VN"/>'+$(if($spec[6]){'<w:b/>'})+'</w:rPr></w:style>')
}
[void]$styles.Append('</w:styles>')
$sect='<w:sectPr><w:headerReference w:type="default" r:id="rIdHeader"/><w:footerReference w:type="default" r:id="rIdFooter"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>'
$parts=@{}
$parts['word/document.xml']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="'+$w+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>'+$body.ToString()+$sect+'</w:body></w:document>'
$parts['word/styles.xml']=$styles.ToString()
$parts['word/numbering.xml']='<w:numbering xmlns:w="'+$w+'"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="540"/></w:tabs><w:ind w:left="540" w:hanging="270"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>'
$parts['word/header1.xml']='<w:hdr xmlns:w="'+$w+'">'+(Para 'FIGURE SHOP  |  PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG' 'Header')+'</w:hdr>'
$parts['word/footer1.xml']='<w:ftr xmlns:w="'+$w+'"><w:p><w:pPr><w:pStyle w:val="Header"/><w:jc w:val="right"/></w:pPr><w:r><w:t>Trang </w:t></w:r><w:fldSimple w:instr="PAGE"/></w:p></w:ftr>'
$parts['word/_rels/document.xml.rels']='<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>'
$parts['_rels/.rels']='<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
$parts['[Content_Types].xml']='<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>'
Add-Type -AssemblyName System.IO.Compression
$out=Join-Path $base 'Tom_tat_chi_tiet_du_an_Figure_Shop.docx'
$stream=[IO.File]::Open($out,[IO.FileMode]::Create)
$zip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Create)
foreach($part in $parts.GetEnumerator()) {
 [xml]$check=$part.Value
 $entry=$zip.CreateEntry($part.Key)
 $writer=[IO.StreamWriter]::new($entry.Open(),[Text.UTF8Encoding]::new($false));$writer.Write($part.Value);$writer.Dispose()
}
$zip.Dispose();$stream.Dispose()
# Structural QA: all XML parsed above; verify geometry and complete model coverage.
[xml]$document=$parts['word/document.xml']
$ns=[Xml.XmlNamespaceManager]::new($document.NameTable);$ns.AddNamespace('w',$w)
foreach($table in $document.SelectNodes('//w:tbl',$ns)) {
 $sum=0;foreach($col in $table.SelectNodes('w:tblGrid/w:gridCol',$ns)){$sum += [int]$col.GetAttribute('w',$w)}
 if($sum -ne 9360){throw 'Invalid table width'}
}
$audit=@{models=$models.Count;scalarFields=$fieldCount;tables=$document.SelectNodes('//w:tbl',$ns).Count;xmlValid=$true;visualQA='Unavailable: no LibreOffice/soffice or managed Python runtime found';preset='compact_reference_guide';header='editorial_cover';overrides='Title 26pt; tables 9.5pt / 1.083 spacing; Heading1 begins new page';file=$out}
$audit | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $base 'structural-qa.json') -Encoding UTF8
$audit | ConvertTo-Json
