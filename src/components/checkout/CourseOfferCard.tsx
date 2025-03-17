/**
 * Component for displaying a course offer card
 */

interface CourseOfferCardProps {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  ctaText: string;
  highlight?: boolean;
  onClick?: () => void;
}

export function CourseOfferCard({
  title,
  description,
  price,
  originalPrice,
  ctaText,
  highlight = false,
  onClick
}: CourseOfferCardProps) {
  return (
    <div className={`rounded-lg p-6 ${highlight ? 'border-2 border-primary bg-primary/5' : 'border border-gray-200'}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>
      
      <div className="mt-4 flex items-end">
        <span className="text-3xl font-bold">${(price / 100).toFixed(2)}</span>
        
        {originalPrice && (
          <span className="ml-2 text-gray-500 line-through">
            ${(originalPrice / 100).toFixed(2)}
          </span>
        )}
        
        {originalPrice && (
          <span className="ml-2 text-green-600 text-sm">
            Save ${((originalPrice - price) / 100).toFixed(2)}
          </span>
        )}
      </div>
      
      <button
        onClick={onClick}
        className={`mt-4 w-full py-2 px-4 rounded-md font-medium ${
          highlight 
            ? 'bg-primary text-white hover:bg-primary/90' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        {ctaText}
      </button>
    </div>
  );
}
