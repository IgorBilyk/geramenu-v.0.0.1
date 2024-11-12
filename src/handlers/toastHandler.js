import { Toaster, toast } from "sonner";

export const successMessage = (msg) => {
  return toast.success("Item has been added!", {
    unstyled: true,
    classNames: {
      toast: "bg-white rounded-xl p-5",
      title: "text-[#1F2937] text-xl",
      success: "text-[#1F2937]",
    },
  });
};

export const warningMessage = (msg) => {
  return toast.success(msg, {
    unstyled: true,
    classNames: {
      toast: "bg-gray-400 rounded-xl p-5",
      title: "text-green-300 text-xl",
      success: "text-[#8FBC8B]",
    },
  });
};
