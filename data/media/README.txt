照片文件放这个文件夹。要求：

1. 文件名只能用小写字母、数字、短横线，扩展名 .webp
   （例如 volleyball-1102.webp，不支持其他扩展名）
2. 同时要在 ../life.json 的 photos 数组里登记一条：
   {
     "id": "volleyball-1102",
     "title": "照片标题",
     "alt": "照片内容的文字描述",
     "date": "2026-11-02",
     "category": "排球",
     "imageUrl": "/media/volleyball-1102.webp",
     "width": 1200,
     "height": 1600
   }
3. width / height 填照片的真实像素，页面靠它预留位置防止跳动。
4. 只有在 life.json 里登记过的照片才能被访问（白名单机制），
   category 写新类别会自动出现在生活页的筛选栏里。
