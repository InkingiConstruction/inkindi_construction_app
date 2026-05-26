import { cn } from "@/lib/utils";
import { useTheme } from "../../theme/theme-provider";
import { cva, type VariantProps } from "class-variance-authority";
import * as Haptics from "expo-haptics";
import { LucideProps } from "lucide-react-native";
import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export const buttonVariants = cva("flex-row items-center justify-center", {
  variants: {
    variant: {
      default: "bg-primary active:opacity-90",
      destructive: "bg-destructive active:opacity-90",
      success: "bg-success active:opacity-90",
      outline: "border border-border bg-transparent active:bg-muted",
      secondary: "bg-secondary active:opacity-80",
      ghost: "bg-transparent active:bg-muted",
      link: "bg-transparent",
    },
    size: {
      default: "h-12 px-8 rounded-xl",
      sm: "h-11 px-6 rounded-lg",
      lg: "h-14 px-9 rounded-2xl",
      icon: "h-12 w-12 rounded-xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      success: "text-success-foreground",
      outline: "text-primary",
      secondary: "text-secondary-foreground",
      ghost: "text-primary",
      link: "text-primary underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const iconSizes = { default: 18, sm: 16, lg: 20, icon: 18 } as const;

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps
  extends Omit<PressableProps, "style">,
    VariantProps<typeof buttonVariants> {
  label?: string;
  children?: React.ReactNode;
  loading?: boolean;
  animation?: boolean;
  haptic?: boolean;
  icon?: React.ComponentType<LucideProps>;
  className?: string;
  style?: ViewStyle;
}

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      label,
      children,
      variant = "default",
      size = "default",
      loading = false,
      animation = true,
      haptic = true,
      icon: IconComponent,
      disabled,
      className,
      style,
      onPressIn,
      onPressOut,
      ...props
    },
    ref
  ) => {
    const tokens = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: any) => {
      if (animation) scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
      if (animation) scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      onPressOut?.(e);
    };

    const spinnerColors: Record<ButtonVariant, string> = {
      default: tokens.primaryForeground,
      destructive: tokens.destructiveForeground,
      success: tokens.successForeground,
      outline: tokens.primary,
      secondary: tokens.secondaryForeground,
      ghost: tokens.primary,
      link: tokens.primary,
    };

    const resolvedVariant = variant ?? "default";
    const resolvedSize = size ?? "default";

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          ref={ref}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          className={cn(
            buttonVariants({ variant, size }),
            (disabled || loading) && "opacity-50",
            className
          )}
          style={style}
          {...props}
        >
          {loading ? (
            <ActivityIndicator size="small" color={spinnerColors[resolvedVariant]} />
          ) : (
            <>
              {IconComponent && (
                <IconComponent
                  size={iconSizes[resolvedSize]}
                  className={cn(
                    buttonTextVariants({ variant }),
                    (label || children) && "mr-2"
                  )}
                />
              )}
              <Text className={buttonTextVariants({ variant, size })}>
                {label ?? children}
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

Button.displayName = "Button";
