const DashboardCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
    <div className={`rounded-full p-3 bg-${color}-100`}>
      <Icon path={icon} className={`w-7 h-7 text-${color}-600`} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);
