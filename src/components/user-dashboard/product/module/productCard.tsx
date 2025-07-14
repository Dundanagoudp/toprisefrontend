import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface ProductcardProps {
  title: string;
  description: string;
  data: {
    label: string;
    value: string;
  }[];
}

export function Productcard({
  title,
  description,
  data,
}: ProductcardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <CardTitle className="text-lg font-bold mb-1 ">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500 mb-4 font-medium">{description}</CardDescription>

        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          {data.map((item, index) => (
            <div key={index}>
              <CardTitle className=" text-gray-500 b3">{item.label}</CardTitle>
              <CardDescription className="text-black font-semibold ">{item.value}</CardDescription>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
