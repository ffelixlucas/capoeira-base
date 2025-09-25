import { useEffect } from "react";

export function useRipple() {
  useEffect(() => {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const circle = document.createElement("span");
        const diameter = Math.max(this.clientWidth, this.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - this.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - this.offsetTop - radius}px`;
        circle.classList.add("ripple-effect");

        // remove ripples antigos
        const ripple = this.getElementsByClassName("ripple-effect")[0];
        if (ripple) ripple.remove();

        this.appendChild(circle);
      });
    });
  }, []);
}
