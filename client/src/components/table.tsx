import tableImage from "../assets/table.png";

const Table = () => {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <img
                src={tableImage}
                className="aspect-auto rotate-45 w-[380px] h-[380px] lg:w-[450px] lg:h-[450px]"
            ></img>
        </div>
    );
};

export default Table;
