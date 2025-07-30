// components/ui/InputBase.jsx
export default function InputBase({ as = "input", className = "", ...props }) {
    const base =
      "w-full border rounded-lg px-3 py-2 text-black text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  
    const Component = as;
  
    return <Component className={`${base} ${className}`} {...props} />;
  }
  