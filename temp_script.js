
        async function submitTrack() {
            const orderId = document.getElementById('orderInput').value.trim();
            const phone = document.getElementById('phoneInput').value.trim();
            const msgBox = document.getElementById('trackingMessage');
            const resBox = document.getElementById('orderResultBox');
            const submitBtn = document.getElementById('trackSubmitBtn');

            if (!orderId || !phone) return;

            msgBox.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';

            try {
                const response = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`);
                const data = await response.json();

                if (!response.ok) {
                    msgBox.className = 'status-cancelled';
                    msgBox.textContent = data.error || 'لم نتمكن من العثور على طلب مطابق للبيانات المدخلة.';
                    msgBox.style.display = 'block';
                    resBox.style.display = 'none';
                    return;
                }

                const order = data.order;
                const items = data.items || [];

                // Fill UI
                document.getElementById('resOrderNumber').textContent = order.order_number || `#${order.id}`;
                document.getElementById('resOrderDate').textContent = new Date(order.created_at).toLocaleDateString('ar-DZ');
                document.getElementById('resWilaya').textContent = `${order.wilaya_name || order.city || 'الجزائر'} (${order.delivery_type === 'desk' ? 'استلام من المكتب' : 'توصيل للمنزل'})`;
                document.getElementById('resPaymentMethod').textContent = order.payment_method === 'chargily' ? 'دفع إلكتروني (بطاقة ذهبية / CIB)' : 'الدفع عند الاستلام (COD)';
                document.getElementById('resOrderTotal').textContent = `${Number(order.total).toLocaleString()} دج`;

                // Status Badge & Stepper
                renderOrderStatus(order.status);

                // Items list
                const tbody = document.getElementById('resOrderItemsBody');
                tbody.innerHTML = items.map(item => {
                    const safeName = window.escapeHtml ? window.escapeHtml(item.name) : item.name;
                    return `
                    <tr>
                        <td>
                            <div class="product-cell">
                                <img src="${item.image_url || '/images/product-placeholder.jpg'}" alt="${safeName}">
                                <span>${safeName}</span>
                            </div>
                        </td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: left; font-weight: bold;">${(Number(item.price) * Number(item.quantity)).toLocaleString()} د.ج</td>
                    </tr>
                `}).join('');

                // Invoice button link
                document.getElementById('viewInvoiceBtn').href = `invoice.html?id=${order.id}&phone=${encodeURIComponent(order.phone)}`;

                resBox.style.display = 'block';
            } catch (err) {
                msgBox.className = 'status-cancelled';
                msgBox.textContent = 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى.';
                msgBox.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-search"></i> تتبع الطلب';
            }
        }

        function renderOrderStatus(status) {
            const badge = document.getElementById('resStatusBadge');
            const progressBar = document.getElementById('timelineProgressBar');
            const s1 = document.getElementById('stepNode1');
            const s2 = document.getElementById('stepNode2');
            const s3 = document.getElementById('stepNode3');
            const s4 = document.getElementById('stepNode4');

            [s1, s2, s3, s4].forEach(s => { s.className = 'step-node'; });

            const statusMap = {
                'pending': { text: 'قيد المراجعة', class: 'status-pending', width: '15%', activeNode: s1 },
                'processing': { text: 'قيد التجهيز والتأكيد', class: 'status-processing', width: '45%', completedNodes: [s1], activeNode: s2 },
                'shipped': { text: 'تم الشحن مع الموزع 🚚', class: 'status-shipped', width: '75%', completedNodes: [s1, s2], activeNode: s3 },
                'delivered': { text: 'تم التسليم بنجاح ✅', class: 'status-delivered', width: '100%', completedNodes: [s1, s2, s3, s4], activeNode: null },
                'cancelled': { text: 'ملغي ❌', class: 'status-cancelled', width: '0%', activeNode: null }
            };

            const current = statusMap[status] || statusMap['pending'];
            badge.textContent = current.text;
            badge.className = `status-badge-custom ${current.class}`;
            progressBar.style.width = current.width;

            if (current.completedNodes) {
                current.completedNodes.forEach(node => node.classList.add('completed'));
            }
            if (current.activeNode) {
                current.activeNode.classList.add('active');
            }
        }

        // Auto load if parameters exist
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('orderId') || urlParams.get('id');
            const phone = urlParams.get('phone');
            if (orderId && phone) {
                document.getElementById('orderInput').value = orderId;
                document.getElementById('phoneInput').value = phone;
                submitTrack();
            }
        });
    
