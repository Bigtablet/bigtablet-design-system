interface ImageProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	priority?: boolean;
	[key: string]: unknown;
}

const Image = ({
	src,
	alt,
	width,
	height,
	className,
	priority: _priority,
	...props
}: ImageProps) => {
	// biome-ignore lint/performance/noImgElement: Storybook mock for next/image — must use raw <img>
	return <img src={src} alt={alt} width={width} height={height} className={className} {...props} />;
};

export default Image;
