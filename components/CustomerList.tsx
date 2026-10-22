import React, { useEffect, useState } from 'react';
import { User, Trash2, Edit2, Check, X, Search, Download, Eye } from 'lucide-react';
import { exportCustomersToExcel } from '../services/order-export';
import { getAllCustomers, updateCustomer, deleteCustomer } from '../services/customer.service';
import { Customer, OrderWithDetails, OrderStatus } from '../types';
import { showToast } from './Toast';
import ConfirmModal from './ConfirmModal';

interface CustomerListProps {
  orders: OrderWithDetails[];
  onRefreshData: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ orders, onRefreshData }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editIsBlocked, setEditIsBlocked] = useState(false);
  const [editBlockReason, setEditBlockReason] = useState('');
  const [profileCustomer, setProfileCustomer] = useState<Customer | null>(null);

  const refresh = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleEdit = (c: Customer) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditPhone(c.phone);
    setEditNotes(c.notes || '');
    setEditIsBlocked(c.isBlocked || false);
    setEditBlockReason(c.blockReason || '');
  };

  const handleSave = async (id: number) => {
    if (!editName.trim() || !editPhone.trim()) {
      showToast('لا يمكن أن يكون الاسم ورقم الهاتف فارغين.', 'error');
      return;
    }
    try {
      await updateCustomer(id, {
        name: editName,
        phone: editPhone,
        notes: editNotes,
        isBlocked: editIsBlocked,
        blockReason: editIsBlocked ? editBlockReason : ''
      });
      setEditingId(null);
      showToast('تم تحديث بيانات العميل بنجاح.');
      await refresh();
    } catch (error) {
      showToast('حدث خطأ أثناء تحديث بيانات العميل.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id);
      showToast('تم حذف العميل.');
      await refresh();
    } catch (error) {
      showToast('حدث خطأ أثناء حذف العميل.', 'error');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const customerOrders = orders.filter(o => o.customerId === profileCustomer?.id);
  const totalDeposit = customerOrders.reduce((sum, o) => sum + Number(o.deposit), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
          <button 
            onClick={() => exportCustomersToExcel(filteredCustomers)}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            title="تصدير العملاء لإكسل"
          >
            <Download className="h-4 w-4" />
            تصدير إكسل
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <User className="h-5 w-5 ml-2 text-indigo-600" />
            إدارة العملاء
          </h3>
          <span className="text-xs text-gray-500">إجمالي: {filteredCustomers.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">المعرف</th>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">الهاتف</th>
                <th className="px-6 py-4">الحالة والملاحظات</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{c.id}</td>
                  <td className="px-6 py-4">
                    {editingId === c.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-indigo-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{c.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === c.id ? (
                      <input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="border border-indigo-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    ) : (
                      <span className="text-gray-500">{c.phone}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2 w-full">
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="ملاحظات العميل..."
                          className="border border-indigo-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                          rows={2}
                        />
                        <label className="flex items-center gap-2 text-xs font-bold text-red-600">
                          <input
                            type="checkbox"
                            checked={editIsBlocked}
                            onChange={(e) => setEditIsBlocked(e.target.checked)}
                            className="h-4 w-4"
                          />
                          حظر العميل
                        </label>
                        {editIsBlocked && (
                          <input
                            value={editBlockReason}
                            onChange={(e) => setEditBlockReason(e.target.value)}
                            placeholder="سبب الحظر (مثال: يلغي الحجوزات)"
                            className="border border-red-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-red-500 outline-none text-xs"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-sm">
                        {c.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            محظور: {c.blockReason || 'غير محدد'}
                          </span>
                        ) : (
                          <span className="text-green-600 text-xs">نشط</span>
                        )}
                        {c.notes && <p className="text-gray-500 text-xs mt-1 truncate">{c.notes}</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === c.id ? (
                      <div className="flex space-x-2 space-x-reverse">
                        <button onClick={() => handleSave(c.id)} className="text-green-600 hover:text-green-800">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-3 space-x-reverse">
                        <button onClick={() => setProfileCustomer(c)} className="text-blue-600 hover:text-blue-800" title="عرض الملف الشخصي">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-800">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-gray-500 text-center">
                    {searchTerm ? 'لا توجد نتائج مطابقة للبحث.' : 'لا يوجد عملاء.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="تأكيد حذف العميل"
        message={
          deleteTarget ? (
            <>
              <p>
                هل أنت متأكد من حذف العميل <span className="font-bold">{deleteTarget.name}</span>؟
              </p>
              <p className="mt-2 text-sm text-gray-500">
                لن يؤدي هذا إلى حذف طلباتهم السابقة.
              </p>
            </>
          ) : null
        }
        confirmText="نعم، احذف العميل"
        cancelText="تراجع"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const targetId = deleteTarget.id;
          setDeleteTarget(null);
          await handleDelete(targetId);
        }}
      />

      {profileCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">ملف العميل: {profileCustomer.name}</h2>
              <button onClick={() => setProfileCustomer(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Info & Total */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                <p className="text-lg font-bold">{profileCustomer.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">الحالة</p>
                <p className={`text-lg font-bold ${profileCustomer.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                  {profileCustomer.isBlocked ? `محظور: ${profileCustomer.blockReason}` : 'نشط'}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-500 mb-1">إجمالي المدفوعات (عربون)</p>
                <p className="text-2xl font-black text-green-700">{totalDeposit.toFixed(2)} ج</p>
              </div>
            </div>

            {profileCustomer.notes && (
              <div className="bg-yellow-50 p-3 rounded-lg mb-6 text-sm">
                <span className="font-bold">ملاحظات: </span>{profileCustomer.notes}
              </div>
            )}

            {/* Orders History Table */}
            <div className="overflow-y-auto flex-1">
              <h3 className="text-lg font-bold mb-3">سجل الطلبات ({customerOrders.length})</h3>
              <table className="w-full text-right text-sm border">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 border-b">رقم الطلب</th>
                    <th className="p-2 border-b">تاريخ الحجز</th>
                    <th className="p-2 border-b">التفاصيل</th>
                    <th className="p-2 border-b">العربون</th>
                    <th className="p-2 border-b">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="p-2 border-b font-bold">#{o.id}</td>
                      <td className="p-2 border-b">{o.receivedDate}</td>
                      <td className="p-2 border-b text-xs align-top">
                        {o.items && o.items.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {o.items.map((i, idx) => (
                              <div key={idx} className="bg-gray-50 p-1.5 rounded border border-gray-200">
                                <span className="font-bold">{i.bookName || i.subject || 'كتاب'}</span>
                                <span className="text-gray-600"> | السنة: {i.grade || o.academicYearName || '-'}</span>
                                <span className="text-gray-600"> | الناشر: {i.publisherName || '-'}</span>
                                <span className="font-bold text-indigo-600"> | الكمية: {i.quantity}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>{o.subject || '-'}</span>
                        )}
                      </td>
                      <td className="p-2 border-b font-bold text-green-700">{Number(o.deposit).toFixed(2)} ج</td>
                      <td className="p-2 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          o.status === OrderStatus.Pending ? 'bg-yellow-100 text-yellow-800' :
                          o.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {o.status === OrderStatus.Pending ? 'قيد الانتظار' : o.status === OrderStatus.Delivered ? 'تم التسليم' : 'ملغي'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
