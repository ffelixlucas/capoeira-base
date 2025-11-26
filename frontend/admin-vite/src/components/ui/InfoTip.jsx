export default function InfoTip({ 
    children, 
    type = "info", // info, success, warning, error
    className = "" 
  }) {
    const styles = {
      info: {
        bg: "bg-gradient-to-r from-blue-50 to-blue-25",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: "bg-blue-500"
      },
      success: {
        bg: "bg-gradient-to-r from-green-50 to-green-25",
        border: "border-green-200",
        text: "text-green-800",
        icon: "bg-green-500"
      },
      warning: {
        bg: "bg-gradient-to-r from-yellow-50 to-yellow-25",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: "bg-yellow-500"
      },
      error: {
        bg: "bg-gradient-to-r from-red-50 to-red-25",
        border: "border-red-200",
        text: "text-red-800",
        icon: "bg-red-500"
      }
    };
  
    const style = styles[type];
  
    return (
      <div className={`flex items-start gap-4 p-4 ${style.bg} ${style.border} border rounded-xl ${style.text} text-sm shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
        <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${style.icon} text-white shadow-sm`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.5v.01M12 12v3.5" />
          </svg>
        </div>
        <div className="flex-1 leading-relaxed">
          {children}
        </div>
      </div>
    );
  }
  