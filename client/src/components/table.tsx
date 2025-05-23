import tableImage from "../assets/table.png";

const Table = () => {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden lg:p-40">
            <img
                src={tableImage}
                className="aspect-auto rotate-45"
            ></img>
        </div>
    );
};

export default Table;
