import LifeIcon from "../assets/life.png";

const LifeBar = ({ lives }: { lives: number }) => {
    return (
        <div className="flex gap-1 absolute inset-0 -top-6 left-1/2 -translate-x-14">
            {Array.from({ length: lives }).map((_, i) => (
                <img
                    src={LifeIcon}
                    alt="life"
                    className="w-5 h-5 outline-1 bg-orange-200 rounded-xs"
                />
            ))}
        </div>
    );
};

export default LifeBar;
